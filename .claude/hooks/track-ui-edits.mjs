#!/usr/bin/env node
// track-ui-edits.mjs
// PostToolUse Edit|Write. If a UI source file was touched this session, append
// the path to .claude/.session-state/<session>.ui-dirty so the Stop hook can
// later demand a Playwright sweep.

import { readHookInput, allow, stateDir, appendFileSync, join } from "./_lib.mjs";

const input = readHookInput();
const filePath = input.tool_input?.file_path ?? "";
const sessionId = input.session_id ?? "default";

if (!filePath) {
  allow();
}

// Excluded — non-visual files even though they sit under src/.
const EXCLUDED = [/\/sitemap\.ts$/, /\/robots\.ts$/, /\/manifest\.ts$/, /\/data\.ts$/, /\/route\.ts$/, /\/route\.tsx$/, /\/_lib\./, /faq-data\.ts$/];
if (EXCLUDED.some((re) => re.test(filePath))) {
  allow();
}

const IS_UI =
  /\/src\/components\/.*\.tsx$/.test(filePath) ||
  /\/src\/app\/.*\.tsx$/.test(filePath) ||
  /\/src\/app\/.*\.css$/.test(filePath);

if (!IS_UI) {
  allow();
}

const flagFile = join(stateDir(), `${sessionId}.ui-dirty`);
appendFileSync(flagFile, `${filePath}\n`);

allow();
