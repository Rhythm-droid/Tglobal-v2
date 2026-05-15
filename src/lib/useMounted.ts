"use client";

import { useEffect, useState } from "react";

/**
 * useMounted — flips to true after the first client paint.
 *
 * Why this exists:
 *   Several motion primitives (MaskReveal, WordReveal, CharSplit,
 *   BlurUnblur, ColorSweep, ScrubScale, RotatingWord) branch their
 *   render tree on `useReducedMotion()`. That hook returns `null` on
 *   the server (no media query available) and the actual preference
 *   on the client's first paint — so SSR can take the "animated"
 *   path while client hydration takes the "static" path. Different
 *   DOM = hydration mismatch.
 *
 *   Components gate the reduce-motion branch behind `mounted`:
 *
 *     const reduceMotion = useReducedMotion();
 *     const mounted = useMounted();
 *
 *     if (!mounted || reduceMotion) {
 *       return <StaticFallback />;     // SSR + first client render
 *     }
 *     return <AnimatedTree />;          // post-mount only
 *
 *   On SSR and the first client render, `mounted` is false, so both
 *   render the static fallback. That guarantees identical markup
 *   for hydration. After the mount effect fires, the component
 *   re-renders and either stays static (if reduceMotion) or
 *   upgrades to the animated tree.
 *
 *   The trade-off: a single extra render on mount (invisible to the
 *   user), and a brief swap from static-to-animated for elements
 *   already in the viewport. The swap is acceptable because the
 *   animated tree starts in `initial="hidden"` and runs whileInView,
 *   so the heading slides in cleanly rather than flickering.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    /* Intentional: this is THE hydration-safe pattern. The whole
       purpose of this hook is to flip false→true exactly once after
       the first client paint, so SSR and the first client render
       agree (mounted=false → static fallback) and only then upgrade
       to the animated tree. Lint rule does not have a carve-out for
       this canonical pattern. */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  return mounted;
}
