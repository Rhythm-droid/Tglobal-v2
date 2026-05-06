"use client";

/**
 * NumberTicker — counts from 0 to a target value when scrolled into view.
 *
 * The "stat bar" classic: big numbers that animate up as the section
 * appears. Lifts perceived authority — a static "10 clients" reads
 * once and is forgotten; a "0 → 10" tick captures attention and
 * implies the count keeps growing.
 *
 * Implementation:
 *   • `useMotionValue(0)` holds the live tween value off-React-state
 *     to avoid re-rendering the parent on every animation frame.
 *   • `useTransform` formats the value (rounding, locale separators)
 *     and feeds the formatted string back into the DOM via
 *     `<motion.span>`'s implicit text rendering.
 *   • `useInView` triggers the animation once per page load when the
 *     element crosses the viewport.
 *   • `animate()` from framer-motion runs the tween; the easing curve
 *     matches the rest of the site's primitives.
 *
 * Why we don't use `requestAnimationFrame` directly:
 *   We could write a manual rAF loop but framer-motion's `animate()`
 *   already handles: spring/tween config, easing curves, completion
 *   callbacks, cancellation on unmount, and reduced-motion detection.
 *   Reinventing it would add bugs without adding behaviour we need.
 *
 * Reduced motion:
 *   When `prefers-reduced-motion` is set, we render the final number
 *   immediately — no count-up. The information is the number itself,
 *   not the count motion, so this is information-equivalent.
 *
 * Accessibility:
 *   The displayed text updates frequently during the animation, which
 *   would spam screen readers if announced. We hide the live number
 *   from AT (`aria-hidden`) and expose the final value via
 *   `aria-label` on a wrapping span, so SR users hear "10 clients" once.
 *
 * Usage:
 *   <NumberTicker value={4} />              // → "4"
 *   <NumberTicker value={1234} />           // → "1,234"
 *   <NumberTicker value={2.5} decimals={1} suffix="x" />  // → "2.5x"
 *   <NumberTicker value={4} prefix="$" suffix="M" />      // → "$4M"
 */

import {
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  motion,
} from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

interface NumberTickerProps {
  /** Target value to count up to. Negative values supported (e.g. -10). */
  value: number;
  /** Decimal places to display. 0 = integer formatting (default). */
  decimals?: number;
  /** Optional prefix (e.g. "$", "+"). */
  prefix?: string;
  /** Optional suffix (e.g. "x", "%", "M", "+"). */
  suffix?: string;
  /** Animation duration in seconds. Default 1.6s — enough to feel
      deliberate, short enough to not annoy on multi-stat sections. */
  duration?: number;
  /** Locale for number formatting. Default "en-US" — adds thousands separators. */
  locale?: string;
  /** Optional className passed through to the wrapping span. */
  className?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export default function NumberTicker({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.6,
  locale = "en-US",
  className,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduceMotion = useReducedMotion();

  /* `useMotionValue` gives us a "subscribable number" that updates
     without triggering React re-renders. Critical for performance:
     a 60fps tick over 1.6s = ~96 updates; running setState 96 times
     would force the React reconciler to walk the tree at 60fps. */
  const motionValue = useMotionValue(0);

  /* `useTransform` derives a formatted string from the motion value.
     The transform runs on each frame inside framer-motion's internal
     scheduler, NOT on the React render path. */
  const formatted = useTransform(motionValue, (latest) => {
    const rounded = Number(latest.toFixed(decimals));
    return `${prefix}${rounded.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`;
  });

  useEffect(() => {
    if (!inView) return;

    /* Reduced motion: jump to the final value instantly. No animation. */
    if (reduceMotion) {
      motionValue.set(value);
      return;
    }

    /* Tween from current → target. `animate()` returns a controls
       object; calling `.stop()` in cleanup cancels in-flight tweens
       so unmounting mid-animation doesn't leak. */
    const controls = animate(motionValue, value, {
      duration,
      ease: EASE,
    });
    return () => controls.stop();
  }, [inView, motionValue, value, duration, reduceMotion]);

  /* Static "final value" string for the aria-label. We compute this
     once here (not from the motion value) so it doesn't change as
     the tween runs — SR users hear the final answer, not midpoints. */
  const finalLabel = `${prefix}${value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`;

  return (
    <span ref={ref} aria-label={finalLabel} className={cn(className)}>
      {/* `aria-hidden` so AT skips the live-updating number; the
          aria-label on the parent provides the announce text. The
          motion.span renders its child as text, which framer-motion
          updates imperatively. `tabular-nums` keeps each digit at the
          same width so the number doesn't visibly jitter as it ticks. */}
      <motion.span aria-hidden style={{ fontVariantNumeric: "tabular-nums" }}>
        {formatted}
      </motion.span>
    </span>
  );
}
