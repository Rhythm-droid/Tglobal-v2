import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("tests/screenshots/work", { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();

page.on("pageerror", (err) => console.log("[err]", err.message));

await page.goto("http://localhost:3000/work", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);

const vh = await page.evaluate(() => window.innerHeight);
const heroH = await page.evaluate(() => document.querySelector("main > section")?.getBoundingClientRect().height ?? 0);
const pinRange = heroH - vh;

const positions = [
  { name: "p1-sharp",      progress: 0.0 },
  { name: "p1-pixel",      progress: 0.3 },
  { name: "morph-peak",    progress: 0.5 },
  { name: "p2-pixel",      progress: 0.7 },
  { name: "chips-reveal",  progress: 0.80 },
  { name: "chips-final",   progress: 0.97 },
];

for (const pos of positions) {
  const y = pinRange * pos.progress;
  await page.evaluate((py) => window.scrollTo({ top: py, behavior: "instant" }), y);
  await page.waitForTimeout(700);
  const railOpacity = await page.evaluate(() => {
    const rail = document.querySelectorAll(".sticky")[0]?.querySelector('[class*="z-[4]"]');
    return rail ? parseFloat(getComputedStyle(rail).opacity) : -1;
  });
  console.log(`  ${pos.name.padEnd(15)} progress=${pos.progress.toFixed(2)}  railOpacity=${railOpacity.toFixed(2)}`);
  await page.screenshot({ path: `tests/screenshots/work/_chip-${pos.name}.png`, fullPage: false });
}

await browser.close();
