#!/usr/bin/env node
// Targeted /about verification — captures axe violation details (selectors + html).

import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  reducedMotion: "no-preference",
});
const page = await ctx.newPage();

const consoleErrors = [];
page.on("pageerror", (e) => consoleErrors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });

await page.goto("http://localhost:3000/about", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1500);

const axe = await new AxeBuilder({ page })
  .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
  .analyze();

for (const v of axe.violations) {
  console.log(`\n=== ${v.id} [${v.impact}] ===`);
  console.log(`Help: ${v.help}`);
  console.log(`URL: ${v.helpUrl}`);
  for (const node of v.nodes) {
    console.log(`\n  Selector: ${node.target.join(" → ")}`);
    console.log(`  HTML:\n    ${node.html.slice(0, 500)}`);
    if (node.failureSummary) {
      console.log(`  Why: ${node.failureSummary.replace(/\n/g, "\n        ")}`);
    }
  }
}

if (axe.violations.length === 0) {
  console.log("✓ axe: 0 violations");
}

console.log(`\nConsole errors: ${consoleErrors.length}`);
for (const e of consoleErrors) console.log(`  - ${e.slice(0, 200)}`);

await browser.close();
