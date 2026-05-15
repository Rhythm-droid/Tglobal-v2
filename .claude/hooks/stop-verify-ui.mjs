#!/usr/bin/env node
// stop-verify-ui.mjs
// Stop hook. If this session edited UI files and no responsive-sweep was run,
// block the "done" claim and tell the agent to verify.
// Tied to feedback_reduced_motion_parity.md.

import { readHookInput, allow, blockStop, stateDir } from "./_lib.mjs";
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const input = readHookInput();
const sessionId = input.session_id ?? "default";

const dir = stateDir();
const dirtyFile = join(dir, `${sessionId}.ui-dirty`);
const verifiedFile = join(dir, `${sessionId}.ui-verified`);
const latestVerified = join(dir, "latest.ui-verified");

// Nothing to verify? Pass.
if (!existsSync(dirtyFile)) {
  allow();
}

// Sweep ran? Clear flags, pass.
if (existsSync(verifiedFile) || existsSync(latestVerified)) {
  try { unlinkSync(dirtyFile); } catch {}
  try { unlinkSync(verifiedFile); } catch {}
  try { unlinkSync(latestVerified); } catch {}
  allow();
}

// UI edited, no sweep — block with a structured message Claude can act on.
const edited = readFileSync(dirtyFile, "utf-8")
  .split("\n")
  .filter(Boolean)
  .filter((v, i, arr) => arr.indexOf(v) === i)
  .slice(0, 10)
  .join("\n");

const reason =
  "UI files were edited this session but no Playwright responsive sweep ran. " +
  "Per feedback_reduced_motion_parity.md, you must verify motion ON + motion OFF across " +
  "the viewport matrix before claiming done.\n\n" +
  `Edited UI files (first 10):\n${edited}\n\n` +
  "Next step: run `npm run sweep -- <route>` (e.g. `npm run sweep -- /about`).\n" +
  "If this turn does not need visual verification (pure refactor / data-only change), " +
  `acknowledge by creating: .claude/.session-state/${sessionId}.ui-verified`;

blockStop(reason);
