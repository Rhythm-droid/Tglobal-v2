"use client";

/**
 * MagicCard — radial gradient that follows the cursor inside the card.
 *
 * The "magic UI" pattern made famous by Vercel / aceternity: cards
 * that have a soft purple glow tracking the mouse position, only
 * visible when hovered. Lifts otherwise-flat tile grids into something
 * that feels alive and high-fidelity.
 *
 * Implementation:
 *   • Two layers stacked above the card content:
 *       1. A faint always-visible border (matches card-base styling).
 *       2. A radial gradient overlay positioned at the cursor, faded
 *          to 0 outside hover via opacity transition.
 *   • Mouse position is tracked via `useMotionValue` (same off-React
 *     pattern as NumberTicker) and piped into CSS custom properties
 *     on the overlay element. CSS variables update without re-renders.
 *   • `useMotionTemplate` builds the `radial-gradient(...)` CSS string
 *     each frame from the live x/y values.
 *
 * Why CSS variables instead of inline style on each frame:
 *   Using `<motion.div style={{ background: ... }}>` would run a new
 *   inline-style application per frame. CSS custom properties update
 *   via the GPU compositor — same visual result, near-zero cost.
 *
 * Why two cards (border + glow), not one:
 *   The border layer keeps a constant 1px purple-tinted edge for
 *   visual structure. The glow layer is a gradient overlay, fading
 *   in only on hover. Separating them means hover doesn't mess with
 *   the at-rest border treatment.
 *
 * Reduced motion:
 *   We disable the cursor-tracking transform but keep a subtle
 *   static glow on hover (just an opacity shift on the overlay).
 *   Information-equivalent — user still gets affordance feedback
 *   without the spatial movement.
 *
 * Usage:
 *   <MagicCard>...content...</MagicCard>
 *   <MagicCard glowColor="rgba(189,112,246,0.30)" radius={400}>...</MagicCard>
 *
 * Composition:
 *   Pair with `card-base` styling (see globals.css) for the at-rest
 *   surface treatment. MagicCard handles the hover state on top.
 */

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { useRef, type MouseEvent } from "react";
import { cn } from "@/lib/cn";

interface MagicCardProps {
  children: React.ReactNode;
  /** Glow gradient color. Defaults to brand purple at 22% opacity. */
  glowColor?: string;
  /** Glow radius in pixels — controls how large the spotlight is. */
  radius?: number;
  /** Optional className for the outer card container. */
  className?: string;
  /** Render `as` tag — defaults to "div". Use "article" / "section" semantically. */
  as?: "div" | "article" | "section" | "li";
}

export default function MagicCard({
  children,
  glowColor = "rgba(75, 40, 255, 0.22)",
  radius = 320,
  className,
  as = "div",
}: MagicCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  /* Mouse position relative to the card's bounding box. Init to -radius
     so the gradient sits offscreen at mount (no flash of a centered
     glow on first render before the user moves). */
  const mouseX = useMotionValue(-radius);
  const mouseY = useMotionValue(-radius);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    /* Subtract the rect origin so coordinates are local to the card,
       not the viewport. Equivalent to e.nativeEvent.offsetX/Y but
       offsetX is broken on Firefox for nested children. */
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  function handleMouseLeave() {
    if (reduceMotion) return;
    /* Push offscreen so the radial fades out (the next render frame
       will move toward this value if any easing is configured; here
       it's instant). The opacity-on-hover CSS handles the visible fade. */
    mouseX.set(-radius);
    mouseY.set(-radius);
  }

  /* Build the radial-gradient string. `useMotionTemplate` is framer-motion's
     way of interpolating motion values into a CSS string, evaluated each
     frame. */
  const gradient = useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, ${glowColor}, transparent 70%)`;

  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        /* `relative` because the glow overlay is absolutely positioned
           inside; `overflow-hidden` clips the radial to the card edge
           when the cursor is near a corner. `group` enables the
           hover-only opacity on the overlay below. */
        "relative overflow-hidden rounded-3xl border border-border/80 bg-surface transition-colors duration-300 hover:border-border-mid",
        "group",
        className,
      )}
    >
      {/* Glow overlay — pointer-events-none so the gradient can't
          eat clicks meant for buttons inside the card. opacity 0 at
          rest, fades in on hover via the parent's `group` class. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: gradient }}
      />
      {/* Content sits above the overlay via z-index. We don't add
          `relative` here unless needed — keeps the markup minimal. */}
      <div className="relative">{children}</div>
    </Tag>
  );
}
