"use client";

import { useScroll, useTransform, motion, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { useMounted } from "@/lib/useMounted";

/* ScrubScale — scroll-driven scale + opacity wrapper.
   ─────────────────────────────────────────────────────────────
   Wrap a hero block in this and as the user scrolls past, it scales
   down (1.0 → scaleTo) and fades (1.0 → opacityTo). Reads like a
   camera pulling away from the headline as the page transitions
   into the next section.

   Tied to scroll progress (scrub), not viewport triggers. No jitter
   when user scrolls back up. */

interface ScrubScaleProps {
  children: ReactNode;
  /** Final scale at scroll-end. Default 0.94. */
  scaleTo?: number;
  /** Final opacity at scroll-end. Default 0.5. */
  opacityTo?: number;
  /** Scroll target offset range. Defaults to "from start to end of viewport". */
  offset?: ["start" | "end" | string, "start" | "end" | string];
  className?: string;
  style?: React.CSSProperties;
}

export default function ScrubScale({
  children,
  scaleTo = 0.94,
  opacityTo = 0.5,
  offset = ["start start", "end start"],
  className,
  style,
}: ScrubScaleProps) {
  const reduceMotion = useReducedMotion();
  const mounted = useMounted();
  const ref = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset as ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, scaleTo]);
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 1, opacityTo]);

  /* Static fallback: SSR + first client render + reduced-motion users.
     Plain div, no scroll-tied transforms. See `useMounted`. */
  if (!mounted || reduceMotion) {
    return (
      <div ref={ref} className={cn(className)} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      style={{ ...style, scale, opacity, willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
