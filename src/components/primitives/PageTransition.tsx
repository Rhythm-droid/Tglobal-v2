"use client";

/**
 * PageTransition — fades + shifts page content on route change.
 *
 * Wraps `children` in a framer-motion `<motion.div>` keyed on the
 * current pathname. When the URL changes, AnimatePresence (mode="wait")
 * runs the exit animation on the OLD page, then mounts the new page
 * with the enter animation. This gives marketing-site-tier route
 * transitions without a full SPA framework.
 *
 * Why mode="wait" not "sync":
 *   "sync" would overlap exit and enter, but Next 16's App Router
 *   already streams the new page into the DOM so the old + new would
 *   render simultaneously, causing layout flash. "wait" lets the
 *   exit complete before the new page paints — visually clean.
 *
 * Why fade + 8px y-shift specifically:
 *   • Fade alone reads as "loading" (sluggish). Pure y-shift reads as
 *     "swipe" (cheap mobile-app feel). The combo of both at small
 *     amplitudes (8px / 200ms) reads as "the page is settling into
 *     place" — Linear / Vercel use almost identical timings.
 *   • 8px is the smallest distance the eye reliably catches as
 *     intentional motion. Larger feels theatrical for a marketing
 *     site (good for art-direction sites; wrong for B2B trust).
 *   • 200ms is below the 250ms threshold where users start perceiving
 *     a delay. Snappy without feeling abrupt.
 *
 * Reduced-motion contract:
 *   `useReducedMotion()` from framer-motion reads the OS-level
 *   `prefers-reduced-motion` setting. When true, we skip the
 *   transform entirely and shorten the fade to 100ms (still fade
 *   to communicate "page changed", just without the spatial cue).
 *
 * Server-component compatibility:
 *   This file is "use client" because framer-motion needs the DOM
 *   for transitions. The wrapped `children` can still be server
 *   components — Next.js App Router passes server-rendered HTML
 *   through client component children just fine.
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  /* Cubic-bezier (0.22, 1, 0.36, 1) — same easing curve used by every
     other primitive on the site (AnimateIn, MagneticPill, etc). Keeps
     the motion language consistent: a soft start, a strong middle, a
     gentle settle. Defining it here as a const so future tweaks
     propagate via TypeScript imports rather than copy-paste. */
  const ease = [0.22, 1, 0.36, 1] as const;
  const duration = reduceMotion ? 0.1 : 0.2;
  const yOffset = reduceMotion ? 0 : 8;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: yOffset }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -yOffset }}
        transition={{ duration, ease }}
        /* `flex-1` so this wrapper inherits the body's flex layout —
           prevents the transition wrapper from collapsing footer to
           the top of the viewport when content is short (e.g. /404). */
        className="flex-1 flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
