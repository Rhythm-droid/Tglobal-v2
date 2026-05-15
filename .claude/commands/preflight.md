---
description: Run typecheck + lint before declaring work done. Project-level alias for "npm run preflight".
allowed-tools: Bash
---

Run the project's preflight checks (typecheck + lint) and report the result.

```bash
npm run preflight
```

If preflight exits 0, say so and list what was checked. If it fails:
1. Quote the actual error output (don't paraphrase).
2. Identify which step failed (typecheck vs lint).
3. Suggest the targeted fix — don't run broad `npm install` / `npm audit fix` /
   `eslint --fix .` unless asked. Per the project's Karpathy principles
   in AGENTS.md, prefer surgical changes.

Do NOT mark a task complete if preflight fails. Per
`feedback_reduced_motion_parity.md` and `verification-before-completion`,
evidence-before-claims is the project's iron rule.
