import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/work", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);

const result = await page.evaluate(() => {
  let el = document.querySelector(".pin-spacer + *, .pin-spacer > *");
  // Actually find the fixed pin layer
  const fixed = Array.from(document.querySelectorAll("body *")).find((e) => {
    const cs = getComputedStyle(e);
    return cs.position === "fixed" && e.className && e.className.includes && e.className.includes("100svh");
  });
  if (!fixed) return { error: "no fixed pin" };
  const r = fixed.getBoundingClientRect();
  const cs = getComputedStyle(fixed);

  // Walk up ancestors looking for transform that breaks fixed
  const ancestors = [];
  let cur = fixed.parentElement;
  while (cur && cur !== document.documentElement) {
    const acs = getComputedStyle(cur);
    if (acs.transform !== "none" || acs.filter !== "none" || acs.perspective !== "none" || acs.willChange !== "auto" || acs.contain !== "none") {
      ancestors.push({
        tag: cur.tagName,
        cls: (typeof cur.className === "string" ? cur.className : "").slice(0, 60),
        transform: acs.transform,
        filter: acs.filter,
        perspective: acs.perspective,
        willChange: acs.willChange,
        contain: acs.contain,
      });
    }
    cur = cur.parentElement;
  }

  return {
    fixedRect: { y: r.y, x: r.x, w: r.width, h: r.height },
    fixedTop: cs.top,
    fixedLeft: cs.left,
    fixedTransform: cs.transform,
    fixedWillChange: cs.willChange,
    ancestorsBreakingFixed: ancestors,
  };
});
console.log(JSON.stringify(result, null, 2));
await browser.close();
