"use client";

/**
 * RotatingWord — slot-machine / scroll-wheel word rotator.
 *
 * Cycles through a list of words at a fixed interval. On each rotation
 * the outgoing and incoming words run simultaneously to read as a
 * single mechanical "scroll":
 *   • the OUTGOING word translates UP (y: 0 → -100%) while picking up
 *     a motion blur and fading out;
 *   • the INCOMING word slides IN from below (y: 100% → 0) while its
 *     blur clears and it fades in.
 * Both pieces are absolutely stacked over an invisible sizing spacer,
 * so the surrounding line never reflows.
 *
 * Why the dual blur + opacity in addition to translate:
 *   A pure y-translate reads as "two stacked words rolling" — fine but
 *   mechanical. Layering motion-blur + opacity onto the same keyframes
 *   turns the swap into a soft scroll-wheel detent: the words "smear"
 *   past the visible slot rather than hard-snapping into place.
 *
 * Clipping strategy:
 *   Translated words must be hidden when they're above/below the line,
 *   but the surrounding inline-block needs `overflow: visible` so its
 *   baseline stays anchored to its text content (overflow != visible
 *   pushes an inline-block's baseline to its bottom margin edge — a
 *   classic CSS gotcha that breaks baseline alignment with siblings).
 *   Solution: outer inline-block stays `overflow: visible`; an inner
 *   absolutely-positioned mask carries `overflow: hidden` to do the
 *   actual clipping. The spacer text sits in the outer box and pins
 *   the baseline.
 *
 * Accessibility:
 *   Mid-animation glyphs would announce as garbage. The active word
 *   carries `aria-label` for assistive tech; the spacer is `aria-hidden`.
 *
 * Reduced motion:
 *   When `prefers-reduced-motion: reduce` is set, rotation is disabled
 *   entirely — only the first word renders, statically.
 *
 * Hydration safety:
 *   `useReducedMotion()` returns `null` on the server (no media query
 *   available there) but the actual user preference on the client's
 *   first render. That divergence makes SSR take the animated path
 *   and the client's first paint take the static path → structural
 *   hydration mismatch. To prevent that we render the *static* span
 *   on SSR AND on the first client render (via a `mounted` gate),
 *   then upgrade to the animated tree on the second render after the
 *   mount effect fires. Both server and first client render are now
 *   identical, so hydration is clean. The cost is one extra render
 *   on mount, which is invisible to the user.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/cn";
import { useMounted } from "@/lib/useMounted";

interface RotatingWordProps {
  /** Words to cycle through. The first word renders initially. */
  words: readonly string[];
  /** Milliseconds each word stays visible before the swap kicks off. */
  interval?: number;
  /** Wipe animation duration in seconds. */
  duration?: number;
  /** Optional className passed to the wrapping span. */
  className?: string;
}

const WHEEL_EASE = [0.32, 0.72, 0.24, 1] as const;
const WHEEL_BLUR_PX = 10;

export default function RotatingWord({
  words,
  interval = 2200,
  duration = 0.55,
  className,
}: RotatingWordProps) {
  const reduceMotion = useReducedMotion();
  const mounted = useMounted();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!mounted || reduceMotion) return;
    if (words.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [interval, mounted, reduceMotion, words.length]);

  const current = words[index] ?? words[0] ?? "";
  /* Longest word determines the sizing-spacer width. Computed inline —
     the array is tiny and the reduce is O(n) per render but trivial. */
  const longest = words.reduce((a, b) => (a.length >= b.length ? a : b), "");

  /* Static path: SSR + first client render + reduced-motion users +
     single-word lists. Identical markup on server and client. */
  if (!mounted || reduceMotion || words.length <= 1) {
    return <span className={className}>{current}</span>;
  }

  return (
    <span
      className={cn(
        "relative inline-block whitespace-nowrap align-baseline",
        className,
      )}
    >
      {/* Invisible sizing spacer — pins width to the longest word AND
          holds the baseline for inline alignment with sibling text.
          The longest word is rendered via a CSS `::before` pseudo-
          element (data-attribute + content: attr(...) defined in
          globals.css) instead of as a real text node, so the H1's
          textContent does NOT include the spacer word. Without this,
          an H1 containing this rotator reads as "We outrun DEADLINES
          ROADMAPS" to crawlers — the spacer's text leaks into the
          document outline even though `visibility: hidden` hides it
          visually. Pseudo-element content is CSS-rendered and
          absent from the DOM tree's textContent. */}
      <span
        aria-hidden
        data-rotator-spacer={longest}
        className="rotator-spacer invisible"
      />
      {/* Inner mask: this is the layer that actually clips the
          translating words. Outer box stays overflow:visible so the
          baseline of the inline-block remains the text baseline. */}
      <span className="pointer-events-none absolute inset-0 overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.span
            key={current}
            aria-label={current}
            className="absolute inset-0"
            initial={{ y: "100%", filter: `blur(${WHEEL_BLUR_PX}px)`, opacity: 0 }}
            animate={{ y: "0%", filter: "blur(0px)", opacity: 1 }}
            exit={{ y: "-100%", filter: `blur(${WHEEL_BLUR_PX}px)`, opacity: 0 }}
            transition={{ duration, ease: [...WHEEL_EASE] }}
          >
            {current}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
