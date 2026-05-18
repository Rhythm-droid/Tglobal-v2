/* Capture per-section close-ups for visual audit. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "/tmp/process-review/sections";
mkdirSync(OUT, { recursive: true });

const SECTIONS = [
  { id: "process-hero", name: "01-hero" },
  { id: "process-contrast", name: "02-contrast" },
  { id: "process-steps", name: "03-steps" },
  { id: "process-anatomy", name: "04-anatomy" },
  { id: "process-triptych", name: "05-triptych" },
  { id: "process-artifacts", name: "06-artifacts" },
  { id: "process-qa", name: "07-qa" },
  { id: "process-cta", name: "08-cta" },
];

const VIEWPORTS = [
  { name: "1280", width: 1280, height: 800 },
  { name: "390", width: 390, height: 844 },
];

const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
  });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:3000/process?cb=${Date.now()}`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(2500);

  // Pre-scroll to trigger any IO observers
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  for (const s of SECTIONS) {
    const el = await page.$(`#${s.id}`);
    if (!el) {
      console.log(`✗ ${vp.name} ${s.name} — element not found`);
      continue;
    }
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const path = join(OUT, `${vp.name}-${s.name}.png`);
    await el.screenshot({ path });
    console.log(`✓ ${vp.name} ${s.name}`);
  }
  await ctx.close();
}

await browser.close();
console.log(`\nDone. Section screenshots in ${OUT}/`);
