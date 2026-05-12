"use client";

import { useScroll, useTransform, motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";

import { cn } from "@/lib/cn";
import { useMounted } from "@/lib/useMounted";

/* ColorSweep — text fills with color as it crosses viewport center.
   ─────────────────────────────────────────────────────────────
   The Apple-iPhone copy effect: paragraph starts in a faded gray and
   each line fills with full ink color as it crosses the upper-middle
   of the viewport. Tied 1:1 to scroll progress (no triggers, no
   intersection observer — pure scroll-velocity-aware paint).

   Implementation:
     • useScroll tracks the element's offset from viewport-bottom to
       viewport-top.
     • useTransform maps that scalar into a CSS variable (--sweep)
       that drives a background-image gradient mask on the text.
     • The text uses background-clip: text so the gradient PAINTS
       through the letterforms.

   Pass `from` and `to` colors. Defaults: muted gray → ink. */

interface ColorSweepProps {
  text: string;
  /** Starting (faded) color. */
  from?: string;
  /** Final (filled) color. */
  to?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  style?: React.CSSProperties;
}

export default function ColorSweep({
  text,
  from = "rgba(3, 2, 11, 0.18)",
  to = "rgba(3, 2, 11, 1)",
  as = "p",
  className,
  style,
}: ColorSweepProps) {
  const reduceMotion = useReducedMotion();
  const mounted = useMounted();
  const ref = useRef<HTMLElement | null>(null);

  /* Track this element's scroll position from viewport-bottom (0) to
     viewport-top (1). The fill happens between these two points, so
     by the time the element exits the top, it's fully colored. */
  const { scrollYProgress } = useScroll({
    target: ref as React.RefObject<HTMLElement>,
    offset: ["start 0.85", "start 0.2"],
  });

  /* Map progress 0..1 → CSS gradient stop position 0%..100%.
     The gradient wipes left-to-right; tweaking offset would change
     direction. */
  const sweepPercent = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const Tag = motion[as] as React.ElementType;

  /* Static fallback: SSR + first client render + reduced-motion users.
     Renders with the final ("filled") color so content is fully
     legible without the scroll-tied sweep. See `useMounted`. */
  if (!mounted || reduceMotion) {
    return (
      <Tag className={cn(className)} style={{ ...style, color: to }}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      className={cn(className)}
      style={{
        ...style,
        backgroundImage: `linear-gradient(90deg, ${to} 0%, ${to} var(--sweep), ${from} var(--sweep), ${from} 100%)`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        ["--sweep" as string]: sweepPercent,
      }}
    >
      {text}
    </Tag>
  );
}
