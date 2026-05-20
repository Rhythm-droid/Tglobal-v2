import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("tests/screenshots/work", { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();

page.on("console", (msg) => console.log(`[browser:${msg.type()}]`, msg.text()));
page.on("pageerror", (err) => console.log("[pageerror]", err.message));

await page.goto("http://localhost:3000/work", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);

const inspect = await page.evaluate(() => {
  const canvases = Array.from(document.querySelectorAll("canvas"));
  return canvases.map((c, i) => {
    const r = c.getBoundingClientRect();
    const ctx = c.getContext("2d");
    let nonZero = 0;
    if (ctx && c.width > 0 && c.height > 0) {
      try {
        const data = ctx.getImageData(c.width / 2 - 50, c.height / 2 - 5, 100, 10).data;
        for (let p = 0; p < data.length; p += 4) {
          if (data[p + 3] > 0) nonZero++;
        }
      } catch { nonZero = -1; }
    }
    return {
      idx: i,
      width: c.width, height: c.height,
      rect: { x: r.x, y: r.y, w: r.width, h: r.height },
      styleImageRendering: getComputedStyle(c).imageRendering,
      visible: r.width > 0 && r.height > 0,
      nonZeroAlphaPixels: nonZero,
      hasParent: !!c.parentElement,
    };
  });
});
console.log("CANVASES:", JSON.stringify(inspect, null, 2));

const vh = await page.evaluate(() => window.innerHeight);
const pinRange = vh * 1.4;

const positions = [
  { name: "p1-sharp", y: 0 },
  { name: "p1-pixelating", y: pinRange * 0.3 },
  { name: "peak", y: pinRange * 0.5 },
  { name: "p2-pixelating", y: pinRange * 0.7 },
  { name: "p2-sharp", y: pinRange * 0.97 },
];

for (const pos of positions) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), pos.y);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `tests/screenshots/work/_pixelate-${pos.name}.png`, fullPage: false });
}

await browser.close();
console.log("Saved 5 screenshots");
