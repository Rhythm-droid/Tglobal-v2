#!/usr/bin/env node
// post-edit-typecheck.mjs
// After Claude edits a .ts/.tsx file under src/, run project-wide tsc --noEmit
// and surface any type errors as a blocking message. Catches cross-file
// regressions a single-file check would miss.

import { readHookInput, block, allow, projectRoot } from "./_lib.mjs";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const input = readHookInput();
const filePath = input.tool_input?.file_path ?? "";

// Only fire on src/**/*.{ts,tsx}.
if (!/\.tsx?$/.test(filePath) || !/\/src\//.test(filePath)) {
  allow();
}

const root = projectRoot();
if (!existsSync(join(root, "tsconfig.json"))) {
  allow();
}

const result = spawnSync("npx", ["--no-install", "tsc", "--noEmit", "--pretty", "false"], {
  cwd: root,
  encoding: "utf-8",
  timeout: 55000,
});

if (result.status === 0) {
  allow();
}

const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
// Prefer errors mentioning the edited file; fall back to first 30 lines.
const relevant =
  output
    .split("\n")
    .filter((l) => l.includes(filePath))
    .slice(0, 30)
    .join("\n") || output.split("\n").slice(0, 30).join("\n");

block(
  `TYPECHECK FAILED after editing ${filePath}\n\n${relevant}\n\nFix the type errors above before continuing. Do not claim "done" until tsc --noEmit exits 0.`
);
