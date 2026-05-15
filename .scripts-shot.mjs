// Screenshot helper. Usage: node /tmp/shot.mjs <url> <outpath> [scroll-px] [width] [height]
import { chromium } from "playwright";

const [, , url, outPath, scrollPx = "0", width = "1440", height = "900"] = process.argv;

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: Number(width), height: Number(height) },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();

page.on("pageerror", (e) => console.error("PAGE ERR:", e.message));
page.on("console", (msg) => {
  if (["error", "warning"].includes(msg.type())) console.log("CONSOLE", msg.type(), msg.text());
});

await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
await page.waitForLoadState("load", { timeout: 15_000 }).catch(() => {});

// Wait for document.fonts.ready manually (the implicit screenshot
// font-wait was timing out under heavy shader load).
await page.evaluate(() =>
  document.fonts ? document.fonts.ready : Promise.resolve()
).catch(() => {});

await page.waitForTimeout(1500);

const sp = Number(scrollPx);
if (sp > 0) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), sp);
  await page.waitForTimeout(900);
}

const vp = page.viewportSize();
await page.screenshot({
  path: outPath,
  clip: { x: 0, y: 0, width: vp.width, height: vp.height },
  timeout: 60_000,
  animations: "disabled",
});
console.log("saved", outPath);

await browser.close();
