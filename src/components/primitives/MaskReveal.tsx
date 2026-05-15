"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useMemo } from "react";

import { cn } from "@/lib/cn";
import { splitWords } from "@/lib/splitWords";
import { useMounted } from "@/lib/useMounted";

/* MaskReveal — word-by-word vertical mask sweep.
   ─────────────────────────────────────────────────────────────
   Sharper than WordReveal: each word lives inside a clipped
   inline-box and translates UP from below the baseline as the
   mask opens. Reads like Stripe Press / Studio Freight headlines
   landing into place — magazine-cover-on-the-web.

   Difference vs WordReveal:
     WordReveal: opacity 0 → 1 + small Y rise. Soft, body-copy feel.
     MaskReveal: hard edge clipped at the top of the line-box,
                 word "rises out from under the line." Heroic feel.

   Use for: headlines, section titles, pull-quotes. Avoid for body
   paragraphs — the hard edge reads as too theatrical at small sizes.

   Accessibility:
     • Aria-label on the wrapper so AT reads the full string.
     • Spans inside are aria-hidden (visual choreography only).
     • Reduced motion path: mounts at final state, no animation. */

interface MaskRevealProps {
  text: string;
  /** "h1" | "h2" | etc. Defaults to "h2". */
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  /** Per-word stagger seconds. */
  stagger?: number;
  /** Per-word reveal duration seconds. */
  duration?: number;
  /** Kept for backward compatibility with callers that pass this
   *  prop — accepted but ignored. Previously controlled the
   *  IntersectionObserver threshold for whileInView. The component
   *  now reveals unconditionally on mount (see comment near the
   *  `animate="visible"` prop below) so there's no IO to gate. */
  amount?: number;
  className?: string;
  /** Optional inline style passed to the wrapper (font-size etc.). */
  style?: React.CSSProperties;
  /** Optional element id (forwarded to the rendered tag) — needed
      when an `aria-labelledby` lookup or anchor jump targets this
      heading. */
  id?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export default function MaskReveal({
  text,
  as = "h2",
  stagger = 0.06,
  duration = 0.85,
  className,
  style,
  id,
}: MaskRevealProps) {
  /* The mounted gate is required so SSR and the client's first
     paint emit the same markup (avoids hydration mismatch on
     framer-motion's variant tree). On top of that we honour
     `prefers-reduced-motion`: if the user opted out of motion,
     keep the static path forever. Previously we ran the animation
     anyway ("brand decision") — that left the text invisible in
     production on reduce-motion devices when the `whileInView`
     trigger never fired and the words stayed clipped at y:110%. */
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  const words = useMemo(() => splitWords(text), [text]);
  const Tag = motion[as] as React.ElementType;
  const StaticTag = as;

  /* SSR + first client render — static path.
     Also taken when the user prefers reduced motion: the visible
     text is the priority, animations are skipped entirely. */
  if (!mounted || reduceMotion) {
    return (
      <StaticTag id={id} className={cn(className)} style={style}>
        {text}
      </StaticTag>
    );
  }

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger } },
  };
  const word: Variants = {
    hidden: { y: "110%" },
    visible: { y: "0%", transition: { duration, ease: EASE } },
  };

  /* `animate="visible"` (not `whileInView`) — the reveal plays
     unconditionally once the component mounts. Previous version
     used `whileInView` with a viewport amount threshold; that
     IntersectionObserver gate broke in production on Cloudflare
     Workers when the parent section sat behind a GSAP ScrollTrigger
     pin — the IO never fired and every word stayed clipped at
     y:110% forever (visible as empty whitespace where the heading
     should be). Mount-time animate has no IO race and still reads
     as a one-shot reveal because the static path above handles
     SSR and the post-hydration animation plays exactly once. */
  return (
    <Tag
      id={id}
      variants={container}
      initial="hidden"
      animate="visible"
      className={cn(className)}
      style={style}
    >
      {/* sr-only label — per-word spans below are aria-hidden so AT users
          would otherwise hear nothing. aria-label is prohibited on
          headings; an sr-only sibling satisfies axe-core while preserving
          the mask-reveal animation. */}
      <span className="sr-only">{text}</span>
      {words.map((w, i) => (
        <span
          key={`${i}-${w}`}
          aria-hidden
          /* Outer clipper. overflow-hidden on a baseline-aligned
             inline-block creates the mask. The inner motion span
             slides up from below the baseline. */
          style={{
            display: "inline-block",
            overflow: "hidden",
            verticalAlign: "bottom",
            paddingBottom: "0.06em",
            paddingRight: "0.22em",
          }}
        >
          <motion.span
            variants={word}
            style={{
              display: "inline-block",
              willChange: "transform",
            }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
