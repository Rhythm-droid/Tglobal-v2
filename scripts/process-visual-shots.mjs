/* Quick visual capture for /process review.
   Takes full-page screenshots at 4 viewports × 2 motion modes. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "/tmp/process-review";
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "390-mobile", width: 390, height: 844 },
  { name: "768-tablet", width: 768, height: 1024 },
  { name: "1280-laptop", width: 1280, height: 800 },
  { name: "1920-desktop", width: 1920, height: 1080 },
];

const MOTIONS = [
  { name: "on", value: "no-preference" },
  { name: "off", value: "reduce" },
];

const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  for (const m of MOTIONS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      reducedMotion: m.value,
    });
    const page = await ctx.newPage();
    await page.goto(`http://localhost:3000/process?cb=${Date.now()}`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(3500);

    // Trigger all IntersectionObservers by scrolling end-to-end
    const totalHeight = await page.evaluate(() => document.body.scrollHeight);
    const steps = Math.ceil(totalHeight / vp.height);
    for (let i = 0; i <= steps; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), i * vp.height);
      await page.waitForTimeout(120);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);

    const path = join(OUT, `${vp.name}-motion-${m.name}.png`);
    await page.screenshot({ path, fullPage: true });
    console.log(`✓ ${vp.name} motion-${m.name}`);
    await ctx.close();
  }
}

await browser.close();
console.log(`\nDone. Screenshots in ${OUT}/`);
