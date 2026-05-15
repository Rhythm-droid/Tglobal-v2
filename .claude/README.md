# Claude Code project setup

This directory configures **Claude Code hooks** that intercept agent tool calls
at runtime. Hooks are how we enforce process rules the agent cannot bypass —
markdown rules in `CLAUDE.md` are advisory; hook scripts return exit code 2
and the agent is hard-blocked.

This addresses a real, documented bug:
[anthropics/claude-code#40117](https://github.com/anthropics/claude-code/issues/40117)
— the agent has been observed using `--no-verify` and `git stash` to bypass
explicit deny rules. Hooks close that gap because they live outside the agent's
tool surface.

## What's here

```
.claude/
├── settings.json            # Shared config + permissions.deny + hooks (committed)
├── settings.local.json      # Local-only permissions allowlist (gitignored)
├── agents/                  # Project-specific subagents (committed)
│   ├── code-reviewer.md     # General reviewer: surgical changes, motion parity, a11y
│   └── nextjs-reviewer.md   # Next.js 16 specifics: app router, RSC boundaries, metadata
├── commands/                # Project-specific slash commands (committed)
│   ├── preflight.md         # /preflight  → npm run preflight (typecheck + lint)
│   ├── sweep.md             # /sweep <route> → npm run sweep on a route
│   └── review.md            # /review [range] → delegate to code-reviewer + nextjs-reviewer
├── hooks/
│   ├── _lib.mjs             # Shared node helper (stdin parsing, exit helpers)
│   ├── block-no-verify.*    # PreToolUse Bash → blocks --no-verify, --no-gpg-sign
│   ├── block-dangerous.*    # PreToolUse Bash → blocks rm -rf /, force push to main/staging, etc.
│   ├── post-edit-typecheck.*# PostToolUse Edit|Write on src/**/*.tsx → runs tsc --noEmit
│   ├── track-ui-edits.*     # PostToolUse Edit|Write → marks session UI-dirty
│   └── stop-verify-ui.*     # Stop → blocks "done" until responsive-sweep ran
└── .session-state/          # Per-session UI-dirty/verified flags (gitignored)
```

## permissions.deny — token savings

`settings.json` blocks Read/Glob/Grep on `node_modules/**`, `.next/**`,
`tests/screenshots/**`, root-level `*.jpeg`/`*.jpg`/`*.png`, and large
binaries under `public/**`. These would otherwise flood the agent's
context window with token-heavy outputs. The agent can still read these
files explicitly by absolute path if a tool needs to — it's a "don't
auto-consume" rule, not a hard lock.

Each hook has a `.sh` wrapper (Claude Code expects shell-style command paths)
that `exec`s the `.mjs` implementation. Logic lives in node because not every
WSL/macOS box has `jq`.

## Hook lifecycle

| Event | Hook | When it fires | What it does |
|---|---|---|---|
| `PreToolUse` (Bash) | block-no-verify | Before any Bash tool call | Blocks if command contains `--no-verify`, `--no-gpg-sign`, or `commit.gpgsign=false`. Strips quoted strings first so `echo "--no-verify"` is allowed. |
| `PreToolUse` (Bash) | block-dangerous | Before any Bash tool call | Blocks `rm -rf /`, `rm -rf $HOME`, `git reset --hard main`, `git push --force` on main/master/staging, `chmod 777`, fork bombs. Strips quoted strings. |
| `PostToolUse` (Edit\|Write) | post-edit-typecheck | After Edit or Write on `*.ts`/`*.tsx` under `src/` | Runs `tsc --noEmit` project-wide; on failure, returns the file-specific errors as a blocking message. Catches cross-file type regressions. |
| `PostToolUse` (Edit\|Write) | track-ui-edits | After Edit or Write on UI files | Records the path in `.session-state/<id>.ui-dirty`. Excludes `sitemap.ts`, `robots.ts`, `manifest.ts`, `data.ts`, route handlers, and `faq-data.ts`. |
| `Stop` | stop-verify-ui | When the agent tries to finish responding | If the session is UI-dirty AND no responsive-sweep ran, returns `{"decision":"block"}` with instructions to run `npm run sweep`. Otherwise clears flags and passes. |

## Responsive sweep

`scripts/responsive-sweep.mjs` is the verification escape valve. It opens a
Playwright Chromium and screenshots a route across 9 viewports × 2 motion
modes = **18 shots per run**.

```bash
npm run sweep -- /about
npm run sweep -- /work/skyline
npm run sweep -- /            # homepage
```

Output:

```
tests/screenshots/<route-slug>/
├── 280-fold-folded-motion-on.png
├── 280-fold-folded-motion-off.png
├── 360-galaxy-s-motion-on.png
├── ... (18 shots total)
└── _summary.json            # timing, console errors, exit status
```

On success, the script writes `.claude/.session-state/latest.ui-verified` so
the `Stop` hook unblocks the next "done" claim.

Why this exists: per `feedback_reduced_motion_parity.md`, every page must
render identically with animations ON and OFF on every breakpoint from
280px (Galaxy Z Fold folded) to 1920px+. Manually testing 18 combinations
per change was unreliable.

## Bypassing verification (when appropriate)

For pure-refactor changes that didn't alter visual output (renaming a
variable, changing comments, swapping `import` order), you can manually
acknowledge:

```bash
touch .claude/.session-state/<session-id>.ui-verified
```

But: if you're not sure, run the sweep. Drift between "I think this is
non-visual" and "this is non-visual" is exactly how the cursor disappeared.

## Adding new hooks

1. Write `your-hook.mjs` in `.claude/hooks/`, import helpers from `./_lib.mjs`.
2. Write a one-line `your-hook.sh` wrapper: `exec node "${CLAUDE_PROJECT_DIR}/.claude/hooks/your-hook.mjs"`.
3. `chmod +x` both files.
4. Register the hook in `.claude/settings.json` under the right `PreToolUse` /
   `PostToolUse` / `Stop` / `SubagentStop` / etc. block.
5. Smoke-test with `printf '%s' '{"tool_input":{...}}' | ./your-hook.sh`.
6. Reload Claude Code (`/hooks` slash command) so the new hook is picked up.

Exit codes:
- **0** — pass-through; agent continues normally
- **2** — block (PreToolUse, UserPromptSubmit); stderr is shown to the agent
- **0 + JSON `{"decision":"block","reason":"..."}` on stdout** — blocks Stop/PostToolUse/SubagentStop

## What this does NOT replace

- **Tests** — hooks block on type errors but don't run your test suite. Add `npm test` to the typecheck hook when you have one.
- **Lint** — eslint is run on demand (`npm run lint` / `npm run preflight`), not via hooks. Add a lint hook when ready.
- **Human review** — hooks prevent obvious mistakes, not architectural ones.

## References

- [Claude Code Hooks docs](https://code.claude.com/docs/en/hooks)
- [disler/claude-code-hooks-mastery](https://github.com/disler/claude-code-hooks-mastery)
- Project memory: `feedback_reduced_motion_parity.md`, `feedback_visual_fidelity.md`
