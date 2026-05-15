"use client";

/**
 * PageTransition — fades page content on route change.
 *
 * Wraps `children` in a framer-motion `<motion.div>` keyed on the
 * current pathname. When the URL changes, AnimatePresence (mode="wait")
 * runs the exit animation on the OLD page, then mounts the new page
 * with the enter animation. Opacity-only — NEVER add `y`, `x`, `scale`,
 * `rotate`, `filter`, or any other transform property here.
 *
 * Why opacity-only (this is a hard constraint, not a style choice):
 *   Per the W3C CSS Transforms spec, any non-`none` `transform` on an
 *   ancestor element creates a NEW containing block for descendants
 *   with `position: fixed`. Even a finished motion animation that ends
 *   at `y: 0` leaves `transform: translateY(0px)` written to the inline
 *   style — non-`none`, so the containing-block rule still triggers.
 *
 *   GSAP ScrollTrigger pins by setting `position: fixed` on the pinned
 *   element. If THIS component has any transform applied, the pin
 *   element becomes "fixed" relative to THIS motion.div instead of the
 *   viewport. As the user scrolls, this div scrolls with the document
 *   and drags every pinned section with it — the visible symptom is a
 *   strip of section background sliding in from above the pin, looking
 *   like a "white/purplish window dropping down from the top." Same
 *   class of bug as `filter`, `perspective`, `backdrop-filter`,
 *   `will-change: transform`, and `contain: paint/strict/content`.
 *
 *   AboutHero (manifesto pin) and AboutTriptych (Ship/Taste/Own pin)
 *   both rely on full-viewport ScrollTrigger pins. They fail
 *   immediately if a transform is reintroduced here.
 *
 * Why mode="wait" not "sync":
 *   "sync" would overlap exit and enter, but Next 16's App Router
 *   already streams the new page into the DOM so the old + new would
 *   render simultaneously, causing layout flash. "wait" lets the
 *   exit complete before the new page paints — visually clean.
 *
 * Reduced-motion:
 *   Animation runs unconditionally — brand decision. The historical
 *   reduced-motion duration short-circuit (100 ms fade for users
 *   with `prefers-reduced-motion: reduce`) has been removed.
 *
 * Server-component compatibility:
 *   This file is "use client" because framer-motion needs the DOM
 *   for transitions. The wrapped `children` can still be server
 *   components — Next.js App Router passes server-rendered HTML
 *   through client component children just fine.
 */

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  /* Cubic-bezier (0.22, 1, 0.36, 1) — same easing curve used by every
     other primitive on the site (AnimateIn, MagneticPill, etc). Keeps
     the motion language consistent: a soft start, a strong middle, a
     gentle settle. */
  const ease = [0.22, 1, 0.36, 1] as const;
  /* Animation runs for every visitor — brand decision. No
     reduced-motion duration short-circuit. */
  const duration = 0.24;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
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
