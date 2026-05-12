"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useMemo } from "react";

import { cn } from "@/lib/cn";
import { splitWords } from "@/lib/splitWords";
import { useMounted } from "@/lib/useMounted";

/* BlurUnblur — focus-rack reveal (filter: blur 14 → 0) per word.
   ─────────────────────────────────────────────────────────────
   Mimics a film camera racking focus from soft to sharp. Combined
   with a gentle Y-rise it feels like the text is settling into
   focus rather than appearing.

   Use for: section subheads, body lead paragraphs, manifesto
   entries. Avoid for tiny labels (blur on 11px text reads as a
   render bug). */

interface BlurUnblurProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  stagger?: number;
  duration?: number;
  amount?: number;
  className?: string;
  style?: React.CSSProperties;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export default function BlurUnblur({
  text,
  as = "p",
  stagger = 0.04,
  duration = 0.9,
  amount = 0.2,
  className,
  style,
}: BlurUnblurProps) {
  const reduceMotion = useReducedMotion();
  const mounted = useMounted();
  const words = useMemo(() => splitWords(text), [text]);
  const Tag = motion[as] as React.ElementType;

  /* Static fallback: SSR + first client render + reduced-motion users.
     See `useMounted` for the rationale. */
  if (!mounted || reduceMotion) {
    return (
      <Tag className={cn(className)} style={style} aria-label={text}>
        {text}
      </Tag>
    );
  }

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger } },
  };
  const word: Variants = {
    hidden: { opacity: 0, filter: "blur(14px)", y: 8 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
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
      aria-label={text}
    >
      {words.map((w, i) => (
        <span
          key={`${i}-${w}`}
          aria-hidden
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          <motion.span
            variants={word}
            style={{
              display: "inline-block",
              willChange: "transform, filter, opacity",
            }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
