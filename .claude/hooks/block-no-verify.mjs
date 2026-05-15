#!/usr/bin/env node
// block-no-verify.mjs
// Fixes Claude Code issue #40117: agent uses --no-verify to bypass commit hooks.
// Pre-commit hooks (lint, typecheck, etc.) exist for a reason; bypassing them
// silently is dishonest. Exit 2 = blocking, agent sees stderr and adjusts.

import { readHookInput, block, allow } from "./_lib.mjs";

const input = readHookInput();
const command = input.tool_input?.command ?? "";

if (!command) {
  allow();
}

// Strip quoted strings so the flag appearing inside echo "..." or grep '...'
// is not a false positive. We only care about the flag in command position.
function stripQuoted(c) {
  return c.replace(/'[^']*'/g, "''").replace(/"[^"]*"/g, '""');
}
const stripped = stripQuoted(command);

// Note on regex: \b doesn't help around "--no-verify" because both edges are
// non-word characters (space-to-dash, dash-to-dash). Anchor on
// (start-of-string | whitespace) before the leading dashes instead.
const BYPASS_PATTERNS = [
  /(^|\s)--no-verify(\s|$)/,
  /(^|\s)--no-gpg-sign(\s|$)/,
  /commit\.gpgsign=false/,
];

for (const pat of BYPASS_PATTERNS) {
  if (pat.test(stripped)) {
    block(
      `--no-verify / hook-bypass flags are forbidden on this project.\n` +
        `Command: ${command}\n` +
        `Reason: Pre-commit hooks (lint, typecheck) exist for a reason. If they fail, fix the underlying issue — do not bypass.`
    );
  }
}

allow();
