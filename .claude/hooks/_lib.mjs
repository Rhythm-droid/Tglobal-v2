// _lib.mjs — shared helpers for Claude Code hook scripts.
//
// Node-based instead of jq because not all dev environments have jq, but
// every project here already requires node. The hooks read JSON from stdin
// and emit either:
//   - exit code 0 + optional stdout (allow / pass-through)
//   - exit code 2 + stderr (blocking error, agent sees the message)
//   - exit code 0 + JSON stdout with {decision: "block", reason: "..."}
//     for Stop / PostToolUse / SubagentStop / PreToolUse permissionDecision

import { readFileSync, mkdirSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export function readHookInput() {
  try {
    const raw = readFileSync(0, "utf-8");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function block(reason) {
  process.stderr.write(`BLOCKED: ${reason}\n`);
  process.exit(2);
}

export function blockStop(reason) {
  process.stdout.write(JSON.stringify({ decision: "block", reason }));
  process.exit(0);
}

export function allow() {
  process.exit(0);
}

export function projectRoot() {
  return process.env.CLAUDE_PROJECT_DIR || process.cwd();
}

export function stateDir() {
  const dir = join(projectRoot(), ".claude", ".session-state");
  mkdirSync(dir, { recursive: true });
  return dir;
}

export { mkdirSync, writeFileSync, appendFileSync, existsSync, join, dirname, fileURLToPath };
