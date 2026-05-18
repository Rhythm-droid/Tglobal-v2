import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/process", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

const results = await new AxeBuilder({ page })
  .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
  .analyze();

for (const v of results.violations) {
  if (v.id !== "button-name" && v.id !== "color-contrast") continue;
  console.log("=".repeat(80));
  console.log(`RULE: ${v.id}  IMPACT: ${v.impact}  NODES: ${v.nodes.length}`);
  console.log(`HELP: ${v.help}`);
  console.log("");
  for (let i = 0; i < Math.min(v.nodes.length, 6); i++) {
    const n = v.nodes[i];
    console.log(`  [${i + 1}] target: ${JSON.stringify(n.target)}`);
    console.log(`      html:   ${(n.html || "").slice(0, 220)}`);
    if (n.failureSummary) {
      console.log(`      why:    ${n.failureSummary.split("\n").join(" | ").slice(0, 320)}`);
    }
    console.log("");
  }
}

await browser.close();
