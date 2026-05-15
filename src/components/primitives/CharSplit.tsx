"use client";

import { motion, type Variants } from "framer-motion";
import { useMemo } from "react";

import { cn } from "@/lib/cn";
import { useMounted } from "@/lib/useMounted";

/* CharSplit — letter-by-letter drop + blur entrance.
   ─────────────────────────────────────────────────────────────
   The most theatrical text reveal. Each letter is its own animated
   span. Drops from -22%, blurs in, scales from 0.96.

   USE ONCE PER PAGE. More than one instance and the page reads as
   "look at all the effects I added" — the trope this whole reset
   is trying to escape.

   Use for: a single hero word, a single section's standout title.
   Avoid for: body, lists, navigation. */

interface CharSplitProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "span" | "div";
  stagger?: number;
  duration?: number;
  amount?: number;
  className?: string;
  style?: React.CSSProperties;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export default function CharSplit({
  text,
  as = "h2",
  stagger = 0.025,
  duration = 0.7,
  amount = 0.3,
  className,
  style,
}: CharSplitProps) {
  /* Animation runs for every visitor regardless of
     `prefers-reduced-motion` — brand decision. */
  const mounted = useMounted();
  /* Split into [{char, isSpace}]. Spaces use a non-breaking space so
     the spans don't collapse and the layout matches the source string. */
  const chars = useMemo(
    () =>
      Array.from(text).map((c) => ({
        char: c === " " ? "\u00A0" : c,
        isSpace: c === " ",
      })),
    [text],
  );
  const Tag = motion[as] as React.ElementType;

  /* SSR + first client render — static path for hydration parity.
     No aria-label: visible text already provides the accessible name. */
  if (!mounted) {
    return (
      <Tag className={cn(className)} style={style}>
        {text}
      </Tag>
    );
  }

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger } },
  };
  const char: Variants = {
    hidden: { opacity: 0, y: "-22%", scale: 0.96, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: "0%",
      scale: 1,
      filter: "blur(0px)",
      transition: { duration, ease: EASE },
    },
  };

  return (
    <Tag
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      className={cn(className)}
      style={style}
    >
      {/* sr-only label — per-char spans are aria-hidden so AT users would
          otherwise hear nothing. aria-label is prohibited on headings;
          an sr-only sibling satisfies axe-core while preserving the
          letter-by-letter animation. */}
      <span className="sr-only">{text}</span>
      {chars.map((c, i) => (
        <motion.span
          key={`${i}-${c.char}`}
          aria-hidden
          variants={char}
          style={{
            display: "inline-block",
            willChange: "transform, opacity, filter",
          }}
        >
          {c.char}
        </motion.span>
      ))}
    </Tag>
  );
}
