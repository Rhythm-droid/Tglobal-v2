---
description: Run the project code-reviewer subagent against the current diff. Use after completing a non-trivial change but before claiming done.
allowed-tools: Bash, Read, Grep, Glob, Task
argument-hint: [optional commit range, defaults to HEAD vs staging]
---

Review the current changes using the project's code-reviewer subagent.

Default range: `staging..HEAD` (changes on the current branch since branching from staging).
User-provided $ARGUMENTS overrides this.

Steps:

1. Compute the diff range. If $ARGUMENTS is empty, use `staging..HEAD`. Otherwise use $ARGUMENTS.
2. Show the user what range is being reviewed and how many files changed:
   ```bash
   git diff --stat <range>
   ```
3. Delegate to the `code-reviewer` subagent via the Task tool with a clear prompt:
   - The diff range to review.
   - The user's explicit request from this session (so the reviewer can judge
     whether changes are "surgical" relative to the ask).
   - Instruction to consult `AGENTS.md` and project memory files.
4. If the diff touches Next.js routing, layouts, metadata, server/client
   boundaries, or `next.config.ts`, ALSO delegate to the `nextjs-reviewer`
   subagent in parallel. Two reviewers run concurrently if both apply.
5. Present the combined report. Group BLOCKERS first, then WARNINGS,
   then VERIFICATION-NEEDED items. Don't fix anything yet — wait for the
   user to confirm what to address.
