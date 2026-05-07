"use client";

import { useEffect } from "react";

/**
 * Idle-time prefetch for below-fold dynamic chunks.
 * ──────────────────────────────────────────────────
 *
 * Why this exists:
 *   `next/dynamic()` defers a chunk's JS download until the import resolves
 *   on render. For sections that render at first paint (Hero, Stats, etc.)
 *   that's a non-issue. For deeply below-the-fold sections (Capabilities,
 *   FAQ, CTA) the chunk doesn't fetch until the user scrolls and React
 *   reaches the dynamic boundary — which means the user is mid-scroll
 *   when the browser starts a network request, parses the JS, and hydrates
 *   the component. That sequence costs the main thread for 50–200 ms,
 *   experienced as a noticeable scroll hiccup.
 *
 * What this component does:
 *   After first paint, schedules the dynamic chunks' import() calls
 *   inside `requestIdleCallback` so the browser fetches/parses them
 *   while the main thread is otherwise idle. By the time the user
 *   scrolls toward those sections, the JS is already in the module
 *   cache and `next/dynamic()` resolves synchronously — hydration
 *   still happens at scroll time but with no network or parse cost.
 *
 * Browser support:
 *   `requestIdleCallback` is universal except Safari, which skips it.
 *   We fall back to `setTimeout(…, 1)` on Safari so the prefetch still
 *   happens, just on the next macrotask instead of an idle window.
 *   The 2 s timeout on the idle callback bounds the worst-case wait
 *   on a heavily loaded main thread.
 *
 * What we do NOT do here:
 *   - We don't pre-hydrate. Hydration of an offscreen client component
 *     would inflate TBT for no UX benefit.
 *   - We don't use IntersectionObserver. That defeats the point — we
 *     specifically want the chunk on disk BEFORE the user scrolls.
 *   - We don't await. import() returns a Promise; React's module cache
 *     captures the result automatically once it resolves.
 *
 * Reduced motion / data saver:
 *   No special handling — prefetch happens regardless. The chunks are
 *   small (<100 KB each gzipped) and only fetch once. If a user has
 *   `Save-Data` set we could opt out, but the bandwidth cost is
 *   negligible compared to the scroll-jank cost on the same connection.
 * ──────────────────────────────────────────────────
 */
export default function IdlePrefetch() {
  useEffect(() => {
    /* The dynamic specifiers MUST match the ones in src/app/page.tsx
       exactly so webpack/Turbopack treat them as the same chunk. If a
       specifier here drifts (e.g. case-sensitive path mismatch on
       Linux), this prefetches a different module than the one the
       page later resolves and the optimisation silently regresses. */
    const prefetch = () => {
      void import("@/components/Capabilities");
      void import("@/components/Faq");
      void import("@/components/CTA");
    };

    /* requestIdleCallback runs the callback when the main thread has
       free cycles; the 2000 ms timeout caps the wait so a heavily
       loaded thread still triggers the prefetch eventually. Safari
       lacks rIC entirely, so we fall back to a short setTimeout — it
       runs on the next macrotask instead of true idle, but is still
       deferred past the initial paint. */
    const ric = (window as Window).requestIdleCallback;
    if (typeof ric === "function") {
      const handle = ric(prefetch, { timeout: 2000 });
      return () => {
        const cic = (window as Window).cancelIdleCallback;
        if (typeof cic === "function") cic(handle);
      };
    }

    const handle = window.setTimeout(prefetch, 1);
    return () => window.clearTimeout(handle);
  }, []);

  return null;
}
