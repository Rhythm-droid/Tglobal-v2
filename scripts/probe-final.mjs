import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/work", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);

const heroH = await page.evaluate(() => document.querySelector("main > section").getBoundingClientRect().height);
const vh = 1080;
const pinRange = heroH - vh;

for (const p of [0.96, 0.98, 1.0]) {
  await page.evaluate((py) => window.scrollTo({ top: py, behavior: "instant" }), pinRange * p);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `/tmp/final-${p}.png`, fullPage: false });

  const items = await page.evaluate(() => {
    const lis = Array.from(document.querySelectorAll('ul[aria-label="Industries served"] li'));
    return lis.map((li) => ({
      text: li.textContent.trim(),
      y: Math.round(li.getBoundingClientRect().y),
      opacity: parseFloat(getComputedStyle(li).opacity),
    }));
  });
  console.log(`\nprogress ${p}:`);
  for (const i of items) console.log(`  ${i.text.padEnd(15)} y=${i.y} opacity=${i.opacity.toFixed(2)}`);
}
await browser.close();
