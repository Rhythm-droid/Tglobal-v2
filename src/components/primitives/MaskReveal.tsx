"use client";

import { motion, type Variants } from "framer-motion";
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
  /** Trigger amount (0-1) of element visible before reveal fires. */
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
  amount = 0.25,
  className,
  style,
  id,
}: MaskRevealProps) {
  /* Animation runs for every visitor regardless of
     `prefers-reduced-motion` — brand decision. The mounted gate is
     still required so SSR and the client's first paint emit the
     same markup (avoids hydration mismatch on framer-motion's
     variant tree). */
  const mounted = useMounted();
  const words = useMemo(() => splitWords(text), [text]);
  const Tag = motion[as] as React.ElementType;

  /* SSR + first client render — static path.
     No aria-label: visible text already provides the accessible name. */
  if (!mounted) {
    return (
      <Tag id={id} className={cn(className)} style={style}>
        {text}
      </Tag>
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

  return (
    <Tag
      id={id}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
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
