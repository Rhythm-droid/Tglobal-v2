"use client";

/* react-scan — dev-only render visualiser.
 *
 * Why it's a client component: react-scan's `scan({ enabled })` call must
 * run in the browser AND the import itself must land in the client bundle.
 * The recommended Next 14+ pattern is a thin client wrapper imported
 * AT THE TOP of root layout so it instruments React before any other
 * client component hydrates.
 *
 * Why not CDN: the previous approach loaded auto.global.js from unpkg via
 * <Script src>, which was blocked by the project's strict Content-Security-
 * Policy (`script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com 'unsafe-eval'`).
 * Importing from the npm package serves it as a self-hosted `_next/static`
 * asset, satisfying `script-src 'self'` without any CSP relaxation.
 *
 * Production stripping: we gate on NODE_ENV at render time. The component
 * returns null in production, so even though the react-scan module gets
 * bundled, the runtime call never fires. If bundle size becomes a concern,
 * switch to a lazy `import("react-scan").then(...)` inside the effect. */

import { useEffect } from "react";

export function ReactScan() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    // Lazy-load so the module is only fetched in dev, never inlined into
    // the production client chunk. The dynamic import keeps prod bundles
    // identical to "no react-scan" — measured with `npm run analyze`.
    import("react-scan")
      .then(({ scan }) => {
        scan({ enabled: true });
      })
      .catch(() => {
        // react-scan failing to load shouldn't crash the app. It's a
        // dev-only diagnostic — if it can't initialise, just skip it.
      });
  }, []);

  return null;
}
