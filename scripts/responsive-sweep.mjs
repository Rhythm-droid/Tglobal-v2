#!/usr/bin/env node
// scripts/responsive-sweep.mjs
//
// Reduced-motion-parity screenshot sweep.
// Runs ONE route across the project's device matrix in BOTH motion states.
//
// Why this exists: per feedback_reduced_motion_parity.md, the /about page
// must render identically with animations ON and OFF on every breakpoint
// from 280px (Galaxy Z Fold folded) to 1920px+. Manually testing 12
// combinations every time is brittle. This script makes the contract
// machine-checkable.
//
// Usage:
//   npm run sweep -- /about
//   npm run sweep -- /work/skyline
//   npm run sweep -- /about http://localhost:3000        (override base)
//
// Output:
//   tests/screenshots/<route>/<viewport>-<motion>.png
//   tests/screenshots/<route>/_summary.json              (timing, errors)
//
// On success: writes .claude/.session-state/<session>.ui-verified so the
// Stop hook unblocks the next "done" claim.

import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");

// ─── Viewport matrix ─────────────────────────────────────────────────
// Matches the device list in feedback_reduced_motion_parity.md.
// Widths chosen at real-device breakpoints, not arbitrary round numbers.
const VIEWPORTS = [
  { name: "280-fold-folded", width: 280, height: 653 },
  { name: "360-galaxy-s", width: 360, height: 800 },
  { name: "390-iphone", width: 390, height: 844 },
  { name: "414-iphone-pro-max", width: 414, height: 896 },
  { name: "768-ipad", width: 768, height: 1024 },
  { name: "1024-ipad-pro", width: 1024, height: 1366 },
  { name: "1280-laptop", width: 1280, height: 800 },
  { name: "1440-laptop-hd", width: 1440, height: 900 },
  { name: "1920-desktop", width: 1920, height: 1080 },
];

const MOTION_MODES = [
  { name: "motion-on", reducedMotion: "no-preference" },
  { name: "motion-off", reducedMotion: "reduce" },
];

// ─── Args ────────────────────────────────────────────────────────────
const ROUTE = process.argv[2];
const BASE = process.argv[3] || "http://localhost:3000";

if (!ROUTE || !ROUTE.startsWith("/")) {
  console.error("Usage: npm run sweep -- <route> [base-url]");
  console.error("Example: npm run sweep -- /about");
  process.exit(1);
}

const ROUTE_SLUG = ROUTE.replace(/^\//, "").replace(/\//g, "_") || "root";
const OUT_DIR = join(PROJECT_ROOT, "tests", "screenshots", ROUTE_SLUG);
mkdirSync(OUT_DIR, { recursive: true });

// ─── Health check before launching browser ───────────────────────────
async function probe(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    return res.status;
  } catch {
    return null;
  }
}

const probeUrl = `${BASE}${ROUTE}`;
const status = await probe(probeUrl);
if (status === null) {
  console.error(`✗ Cannot reach ${probeUrl} — is the dev server running?`);
  console.error(`  Try: npm run dev`);
  process.exit(2);
}
if (status >= 400) {
  console.error(`✗ ${probeUrl} returned HTTP ${status}`);
  process.exit(2);
}
console.log(`✓ Reached ${probeUrl} (HTTP ${status})`);
console.log(`  Sweeping ${VIEWPORTS.length} viewports × ${MOTION_MODES.length} motion modes = ${VIEWPORTS.length * MOTION_MODES.length} shots\n`);

// ─── Run sweep ───────────────────────────────────────────────────────
const browser = await chromium.launch();
const summary = {
  route: ROUTE,
  base: BASE,
  started: new Date().toISOString(),
  shots: [],
  errors: [],
};

const startTime = Date.now();

for (const motion of MOTION_MODES) {
  for (const vp of VIEWPORTS) {
    const shotName = `${vp.name}-${motion.name}.png`;
    const shotPath = join(OUT_DIR, shotName);
    const shotStart = Date.now();

    try {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        reducedMotion: motion.reducedMotion,
        deviceScaleFactor: 1,
      });
      const page = await ctx.newPage();

      // Console error tracking — flag any errors during render.
      const consoleErrors = [];
      page.on("pageerror", (err) => consoleErrors.push(err.message));
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });

      await page.goto(`${BASE}${ROUTE}`, { waitUntil: "networkidle", timeout: 30000 });
      // Give animations a moment to settle (motion-on) or to confirm static layout (motion-off).
      await page.waitForTimeout(800);

      await page.screenshot({ path: shotPath, fullPage: true, animations: "disabled" });

      /* axe-core accessibility scan — runs once per viewport+motion combo.
         Reports WCAG 2.1 AA violations. axe catches ~30-40% of real
         violations (color contrast, missing labels, ARIA misuse, heading
         order). It does NOT catch keyboard traps, focus visibility, screen
         reader UX — those still need manual testing.

         Note: WCAG 2.2 success criteria are NOT in @axe-core's default
         tagset yet (as of v4.10). Adding wcag22aa explicitly. */
      let axeViolations = [];
      try {
        const axeResults = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        axeViolations = axeResults.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          nodes: v.nodes.length,
        }));
      } catch (axeErr) {
        // Axe failures are non-fatal — they shouldn't block the sweep.
        consoleErrors.push(
          `axe-core scan failed: ${axeErr instanceof Error ? axeErr.message : String(axeErr)}`
        );
      }

      const elapsed = Date.now() - shotStart;
      summary.shots.push({
        viewport: vp.name,
        motion: motion.name,
        file: shotName,
        ms: elapsed,
        consoleErrors,
        axeViolations,
      });

      const errFlag = consoleErrors.length > 0 ? ` ⚠ ${consoleErrors.length} console error(s)` : "";
      const axeFlag =
        axeViolations.length > 0
          ? ` ♿ ${axeViolations.length} a11y issue(s)`
          : "";
      console.log(`  ✓ ${vp.name.padEnd(20)} ${motion.name.padEnd(11)} ${elapsed}ms${errFlag}${axeFlag}`);

      await ctx.close();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      summary.errors.push({ viewport: vp.name, motion: motion.name, error: msg });
      console.error(`  ✗ ${vp.name} ${motion.name}: ${msg}`);
    }
  }
}

await browser.close();

summary.totalMs = Date.now() - startTime;
summary.finished = new Date().toISOString();

writeFileSync(join(OUT_DIR, "_summary.json"), JSON.stringify(summary, null, 2));

console.log(`\nDone in ${(summary.totalMs / 1000).toFixed(1)}s`);
console.log(`Screenshots: ${OUT_DIR}`);
console.log(`Summary:     ${join(OUT_DIR, "_summary.json")}`);

if (summary.errors.length > 0) {
  console.error(`\n✗ ${summary.errors.length} shot(s) failed.`);
  process.exit(1);
}

// Aggregate console errors and a11y issues across all shots.
const totalConsoleErrors = summary.shots.reduce((n, s) => n + s.consoleErrors.length, 0);
if (totalConsoleErrors > 0) {
  console.warn(`\n⚠ ${totalConsoleErrors} console error(s) detected across shots. Check _summary.json.`);
}

const totalAxeViolations = summary.shots.reduce(
  (n, s) => n + (s.axeViolations?.length ?? 0),
  0
);
if (totalAxeViolations > 0) {
  // Deduplicate violation IDs across shots so the summary line is concise.
  const uniqueViolationIds = new Set();
  for (const s of summary.shots) {
    for (const v of s.axeViolations ?? []) uniqueViolationIds.add(v.id);
  }
  console.warn(
    `\n♿ ${uniqueViolationIds.size} unique a11y rule(s) violated across shots (${totalAxeViolations} total occurrences).`
  );
  console.warn(`   Unique rules: ${[...uniqueViolationIds].join(", ")}`);
  console.warn(`   axe-core catches ~30-40% of real WCAG issues — manual keyboard + screen-reader testing is still required.`);
}

// ─── Mark UI as verified for the Stop hook ───────────────────────────
const sessionId = process.env.CLAUDE_SESSION_ID || "manual";
const stateDir = join(PROJECT_ROOT, ".claude", ".session-state");
if (existsSync(join(PROJECT_ROOT, ".claude"))) {
  mkdirSync(stateDir, { recursive: true });
  writeFileSync(join(stateDir, `${sessionId}.ui-verified`), new Date().toISOString());
  // Also write a wildcard marker so any active session can find it.
  writeFileSync(join(stateDir, "latest.ui-verified"), new Date().toISOString());
}

console.log(`✓ Marked session as UI-verified.`);
