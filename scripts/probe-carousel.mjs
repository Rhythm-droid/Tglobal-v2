import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/work", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);

const heroH = await page.evaluate(() => document.querySelector("main > section").getBoundingClientRect().height);
const vh = 1080;
const pinRange = heroH - vh;

console.log(`heroH=${heroH} vh=${vh} pinRange=${pinRange}`);

// Test the carousel beats:
//   0.30 → mid-morph (Phase 1 should be active just after 0.25)
//   0.55 → after morph, before split
//   0.60 → mid-split
//   0.62 → fade just complete (Healthcare centered)
//   0.70 → 21% into carousel (around index 1-2)
//   0.85 → mid carousel (index 4-5)
//   1.00 → end (Telecom centered)
for (const p of [0.30, 0.55, 0.60, 0.62, 0.70, 0.85, 1.0]) {
  await page.evaluate((py) => window.scrollTo({ top: py, behavior: "instant" }), pinRange * p);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `/tmp/carousel-${p}.png`, fullPage: false });

  const data = await page.evaluate(() => {
    const lis = Array.from(document.querySelectorAll('ul[aria-label="Industries served"] li'));
    return lis.map((li) => {
      const span = li.querySelector("span");
      const r = (span ?? li).getBoundingClientRect();
      const cs = getComputedStyle(li);
      return {
        text: li.textContent.trim(),
        y: Math.round(r.y + r.height / 2),  // center y
        opacity: parseFloat(cs.opacity).toFixed(2),
        transform: cs.transform.slice(0, 40),
      };
    });
  });

  const ulInfo = await page.evaluate(() => {
    const ul = document.querySelector('ul[aria-label="Industries served"]');
    if (!ul) return null;
    return {
      transform: getComputedStyle(ul).transform.slice(0, 60),
      opacity: parseFloat(getComputedStyle(ul.parentElement).opacity).toFixed(2),
    };
  });

  console.log(`\nprogress ${p}:  rail-opacity=${ulInfo?.opacity}  ul-transform=${ulInfo?.transform}`);
  for (const i of data) console.log(`  ${i.text.padEnd(16)} center-y=${i.y}  op=${i.opacity}  ${i.transform}`);
}
await browser.close();
