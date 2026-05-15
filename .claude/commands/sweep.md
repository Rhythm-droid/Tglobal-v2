---
description: Run the Playwright responsive sweep on a route. Verifies motion-ON + motion-OFF parity across the 9-viewport matrix and runs axe-core a11y scans. Required by the Stop hook before any UI claim can be marked done.
allowed-tools: Bash
argument-hint: <route> e.g. /about
---

Run the responsive sweep on the route the user specified.

If the user didn't give a route in their message, ask them which route to sweep
before running anything. Common targets: `/`, `/about`, `/work/skyline`, `/process`.

```bash
npm run sweep -- $ARGUMENTS
```

After the run:
1. If the script exited 0, summarise: shots taken, total time, any console
   errors flagged, any axe-core violations. Quote the unique rule IDs.
2. If shots failed, list which viewport+motion combos failed and quote the
   error. Most common cause: the dev server isn't running on port 3000.
3. Confirm that the Stop hook is now satisfied by checking for the
   `latest.ui-verified` flag in `.claude/.session-state/`.

If axe violations are found, list them but DO NOT auto-fix — surface them to
the user and ask whether to address them now or open follow-up tasks.
Accessibility fixes often touch ARIA, copy, and layout — that's a human
judgment call per `AGENTS.md` "Think Before Coding".
