#!/usr/bin/env node
// block-dangerous.mjs
// Blocks irreversible operations per CLAUDE.md "Executing actions with care".
// Allows non-destructive forms (e.g., rm of a specific file is fine).

import { readHookInput, block, allow } from "./_lib.mjs";

const input = readHookInput();
const command = input.tool_input?.command ?? "";

if (!command) {
  allow();
}

// Strip strings (single and double quoted) before matching so dangerous
// patterns embedded inside echo "rm -rf /" or grep 'force push' don't
// trigger false positives. Bash variable interpolation inside strings is
// not stripped intentionally — that's the only sensible attack surface.
function stripQuotedSegments(cmd) {
  // Remove anything between matched single quotes or double quotes.
  return cmd.replace(/'[^']*'/g, "''").replace(/"[^"]*"/g, '""');
}

const stripped = stripQuotedSegments(command);

const DANGEROUS = [
  { pattern: /(^|[;&|\n]\s*)rm\s+-rf\s+\/(\s|$)/, why: "rm -rf on root" },
  { pattern: /(^|[;&|\n]\s*)rm\s+-rf\s+\$HOME/, why: "rm -rf on $HOME" },
  { pattern: /(^|[;&|\n]\s*)rm\s+-rf\s+~(\s|$)/, why: "rm -rf on home dir" },
  { pattern: /(^|[;&|\n]\s*)rm\s+-rf\s+\*\s*$/, why: "rm -rf glob with no path" },
  { pattern: /(^|[;&|\n]\s*)git\s+reset\s+--hard\s+(origin\/)?(main|master|staging)\b/, why: "hard reset on protected branch" },
  { pattern: /(^|[;&|\n]\s*)git\s+push\s+.*--force.*\b(main|master|staging)\b/, why: "force push to protected branch" },
  { pattern: /(^|[;&|\n]\s*)git\s+push\s+.*\s-f\s+.*\b(main|master|staging)\b/, why: "force push to protected branch" },
  { pattern: /(^|[;&|\n]\s*)git\s+branch\s+-D\s+(main|master|staging)\b/, why: "delete protected branch" },
  { pattern: /(^|[;&|\n]\s*)chmod\s+777\b/, why: "world-writable permissions" },
  { pattern: /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/, why: "fork bomb" },
];

for (const { pattern, why } of DANGEROUS) {
  if (pattern.test(stripped)) {
    block(
      `Destructive command pattern detected: ${why}\n` +
        `Command: ${command}\n` +
        `Reason: This is irreversible and may affect shared state. Ask the user first.`
    );
  }
}

allow();
