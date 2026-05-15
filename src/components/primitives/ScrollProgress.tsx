"use client";

/**
 * ScrollProgress — fixed bar at the top of the viewport that fills
 * left-to-right as the user scrolls down the page.
 *
 * Used on long-form routes — case study detail pages, /privacy, /terms,
 * eventually /insights articles — to give the reader a sense of "how
 * much is left." Removes the friction of "is this 5 more screens or 50?"
 *
 * Implementation:
 *   • framer-motion's `useScroll()` returns a `MotionValue<number>` in
 *     the 0–1 range representing scroll progress through the document.
 *   • We pipe it directly into a `<motion.div>`'s `scaleX` style. The
 *     transform is applied on the GPU compositor — no per-frame React
 *     state changes, no JS scroll listener.
 *   • `transform-origin: 0% 50%` so the bar grows from the LEFT edge,
 *     not the center.
 *
 * Why not the `<progress>` element:
 *   The native `<progress>` element doesn't accept transform-based
 *   updates cleanly across browsers; styling its bar is a cross-browser
 *   nightmare (different pseudo-elements per engine). A `<motion.div>`
 *   gives us full control with a single rule.
 *
 * Reduced motion:
 *   We still show the bar — it's an information indicator, not
 *   decorative motion. Without it, long-form pages lose a useful UX
 *   cue. The bar growth itself is just `scaleX` — the user perceives
 *   progress, not "an animation playing."
 *
 * Where to mount:
 *   At the top of any long page, OUTSIDE main content so it's
 *   always visible. Typically right after `<Navbar />`. The fixed
 *   positioning means it won't push other content.
 *
 * Usage:
 *   <ScrollProgress />
 *   <ScrollProgress className="bg-accent-violet h-[3px]" />
 */

import { motion, useScroll, useSpring } from "framer-motion";
import { cn } from "@/lib/cn";

interface ScrollProgressProps {
  /** Optional className override (height, color, z-index). */
  className?: string;
}

export default function ScrollProgress({ className }: ScrollProgressProps) {
  /* `useScroll()` with no args tracks the document's scroll position.
     `scrollYProgress` is 0 when at the top, 1 when fully scrolled. */
  const { scrollYProgress } = useScroll();

  /* Smooth the progress with a spring so the bar doesn't jitter on
     scroll snap, momentum scrolling on iOS, or Lenis's smooth scroll
     interpolation. Spring config: stiff (200) + low damping (30) =
     responsive but not bouncy. Restdelta tunes the threshold below
     which the spring snaps to its target — 0.001 for visual cleanliness. */
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className={cn(
        /* Fixed at the very top, full width. `z-50` to clear the navbar
           (which uses z-50 too — we add `top-0` and let the navbar own
           the rest of the header). The `origin-left` means scaleX
           grows from the left edge. */
        "fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-primary",
        className,
      )}
      style={{ scaleX }}
    />
  );
}
