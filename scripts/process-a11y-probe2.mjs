import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`http://localhost:3000/process?cb=${Date.now()}`, {
  waitUntil: "networkidle",
});
await page.waitForTimeout(3000);

// Find any amber-related classes still in the live DOM
const ambers = await page.$$eval("[class*='amber']", (els) =>
  els.slice(0, 8).map((e) => ({
    tag: e.tagName.toLowerCase(),
    text: (e.textContent || "").slice(0, 40).trim(),
    classes: e.getAttribute("class")?.match(/text-amber-\d+/g) || [],
  })),
);
console.log("Amber elements in live DOM:", JSON.stringify(ambers, null, 2));

await browser.close();
