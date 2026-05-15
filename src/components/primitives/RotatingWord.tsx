"use client";

/**
 * RotatingWord — cycling word rotator with a per-character blur-up
 * reveal.
 *
 * Each letter of the incoming word starts blurred + offset DOWN and
 * settles into focus and place with a 50ms stagger left-to-right.
 * The outgoing word reverses the choreography — letters peel from
 * the trailing edge first, drifting UP and blurring out. The motion
 * is sourced from Componentry's TextAnimate `blurInUp` adapted into
 * a cycling rotator (loop through the word list at `interval`
 * instead of running once on viewport entry).
 *
 * Width pinning:
 *   An invisible CSS `::before` spacer sized to the longest word
 *   locks the slot width so the surrounding line never reflows
 *   mid-swap. The spacer is pseudo-element content so it stays out
 *   of the document text-node tree (screen readers + crawlers don't
 *   pick up spacer noise).
 *
 * Accessibility:
 *   • The visible animated layer is `aria-hidden` — mid-stroke
 *     partial words would announce as garbage.
 *   • A sibling `aria-live="polite"` span carries the current word
 *     so AT announces once per cycle.
 *
 * Reduced motion:
 *   Animation runs unconditionally — brand decision (see
 *   MotionProvider). The mounted gate below stays in place purely
 *   for hydration safety, not for accessibility opt-out.
 *
 * Hydration safety:
 *   SSR + first client render must emit identical markup to avoid a
 *   hydration mismatch on framer-motion's AnimatePresence tree. The
 *   `useMounted` gate renders the static first-word span on SSR and
 *   the very first client paint, then swaps to the animated tree on
 *   the post-mount render.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/cn";
import { useMounted } from "@/lib/useMounted";

interface RotatingWordProps {
  /** Words to cycle through. The first word renders initially. */
  words: readonly string[];
  /** Milliseconds each fully-displayed word holds before the swap. */
  interval?: number;
  /** Swap animation duration in seconds (per character). */
  duration?: number;
  /** Optional className passed to the wrapping span. */
  className?: string;
}

/* Stagger between adjacent letters' animations. 50ms reads as a
   crisp cascade on 6–9 character hero words; tighter (30ms) reads
   as instant, looser (80ms) drags. */
const LETTER_STAGGER = 0.05;
/* How blurred each letter starts. 10px is enough to read as
   "coming into focus" without obscuring the glyph shape. */
const BLUR_PX = 10;
/* Vertical travel per letter on enter (down → 0) and exit (0 → up).
   0.6em scales with font-size so the motion arc stays proportional
   across hero/body/caption uses of the rotator. */
const Y_OFFSET = "0.6em";

export default function RotatingWord({
  words,
  interval = 2200,
  duration = 0.55,
  className,
}: RotatingWordProps) {
  /* Animation runs for every visitor regardless of
     `prefers-reduced-motion` — brand decision. The mounted gate is
     still required to prevent a hydration mismatch: SSR renders the
     first word statically; after mount, the animated rotator takes
     over. Without the gate, framer-motion's AnimatePresence emits
     different markup on the server vs. the client's first paint. */
  const mounted = useMounted();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!mounted || words.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [interval, mounted, words.length]);

  const current = words[index] ?? words[0] ?? "";
  /* Longest word determines the sizing-spacer width. Computed
     inline — the array is tiny and the reduce is O(n) per render
     but trivial. */
  const longest = words.reduce((a, b) => (a.length >= b.length ? a : b), "");

  /* SSR + first client render + single-word lists fall through to a
     static span so server/client paint identical markup. */
  if (!mounted || words.length <= 1) {
    return <span className={className}>{current}</span>;
  }

  return (
    <span
      className={cn(
        "relative inline-block whitespace-nowrap align-baseline",
        className,
      )}
    >
      {/* Invisible width-pinning spacer. See file header for why
          this is pseudo-element content instead of a real text
          node. */}
      <span
        aria-hidden
        data-rotator-spacer={longest}
        className="rotator-spacer invisible"
      />
      {/* Animated layer. Left-anchored over the spacer so every
          word's leading edge starts at the same x-position
          regardless of length. */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-0"
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.span key={current} className="inline-block">
            {current.split("").map((ch, i) => (
              <motion.span
                key={`${current}-${i}`}
                initial={{
                  opacity: 0,
                  y: Y_OFFSET,
                  filter: `blur(${BLUR_PX}px)`,
                }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{
                  opacity: 0,
                  y: `-${Y_OFFSET}`,
                  filter: `blur(${BLUR_PX}px)`,
                  transition: {
                    duration: duration * 0.6,
                    delay: (current.length - 1 - i) * LETTER_STAGGER,
                    ease: [0.55, 0, 0.65, 0.2],
                  },
                }}
                transition={{
                  duration,
                  delay: i * LETTER_STAGGER,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="inline-block"
              >
                {ch}
              </motion.span>
            ))}
          </motion.span>
        </AnimatePresence>
      </span>
      {/* Live-region announcement for AT. Visually hidden. */}
      <span
        aria-live="polite"
        className="absolute h-px w-px overflow-hidden whitespace-nowrap"
        style={{ clip: "rect(0 0 0 0)", clipPath: "inset(50%)" }}
      >
        {current}
      </span>
    </span>
  );
}
