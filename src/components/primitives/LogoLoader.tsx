"use client";

import { useEffect, useRef } from "react";

/* LogoLoader — branded loading indicator using the TGlobal brand mark.
   ─────────────────────────────────────────────────────────────
   Decomposes the brand glyph into its five constituent rectangles
   and lights them up in sequence — like a dot-matrix loader, but
   the dots ARE the logo. Each cycle traces the mark left-to-right
   / top-to-bottom and resets, communicating "loading" while the
   shape that's loading IS the brand.

   The 5 rectangles, in animation order:
     1. Top-left corner block       (0–8 × 0–8)
     2. Top wide bar                (16–40 × 0–8)   — 3 cells
     3. Middle vertical column      (8–16 × 8–32)   — 3 cells tall
     4. Bottom bar                  (16–32 × 32–40) — 2 cells
     5. Mid-right small square      (32–40 × 16–24)

   Geometry traced from the original path:
     • Bottom bar's right edge is at x=32 (not 40) — verified from
       the path commands `H31.6797` and `C... 32 32.3203V39.6797`.
     • Middle column goes 8→16 across, 8→32 down — three cells tall.
     • Top bar spans 16→40 across the right three cells.
   Drawn at full opacity in this layout, these five rects match
   the original glyph at 40×40 viewBox (minor corner rounding lost,
   invisible at small button sizes).

   Why Web Animations API (not CSS keyframes, not framer-motion):
     • CSS @keyframes targeting custom selectors got stripped by
       the Tailwind v4 + Turbopack pipeline during HMR.
     • framer-motion's animation on this component was intercepted
       by the parent <AnimatePresence> wrapping the CTA form.
     • element.animate() bypasses both — runs reliably on every
       rect independently regardless of parent React context.

   Containing-block safety:
     The animation writes `opacity` only (no transform). Cannot
     create a containing block for fixed descendants. Safe to use
     anywhere, including as a sibling of pinned ScrollTrigger
     sections.

   Color: `currentColor` — inherits text color from the parent.
   On a primary-purple button (white text), the loader is white.
   On a light card with dark text, it's dark.

   Reduced motion: skip the animation entirely and render all
   five rectangles at 70% opacity. The mark is still legible, the
   affordance still communicates "pending", but there's no pulse. */

const RECT_SEQUENCE = [
  // Each rect's coordinates in the 40×40 viewBox, plus its
  // staggered delay (ms) into the 1000ms animation cycle. The
  // delays run 0 → 320 in 80ms steps so all five rects start
  // their peak within the first third of the cycle — reads as
  // "actively chasing" not "stepping one at a time then resting".
  { x: 0,  y: 0,  w: 8,  h: 8,  delay: 0 },
  { x: 16, y: 0,  w: 24, h: 8,  delay: 80 },
  { x: 8,  y: 8,  w: 8,  h: 24, delay: 160 },
  { x: 16, y: 32, w: 16, h: 8,  delay: 240 },
  { x: 32, y: 16, w: 8,  h: 8,  delay: 320 },
] as const;

interface LogoLoaderProps {
  size?: number;
  /** Optional accessible label. Defaults to "Loading". */
  ariaLabel?: string;
  className?: string;
  /** Color of the "lit / active" state in the cascade. Each rect
      reaches this color at its peak. Default is a near-black ink. */
  colorActive?: string;
  /** Color of the "off / resting" state. Each rect sits at this
      color between peaks. Pick a color that contrasts strongly with
      `colorActive` so the swap reads as a clean two-state toggle
      rather than a fade. Default is white. */
  colorRest?: string;
}

export default function LogoLoader({
  size = 22,
  ariaLabel = "Loading",
  className = "",
  colorActive = "#0e0a1e",
  colorRest = "#ffffff",
}: LogoLoaderProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const rects = Array.from(svg.querySelectorAll("rect"));

    if (reduce) {
      rects.forEach((r) => {
        r.style.fill = colorActive;
        r.style.opacity = "0.7";
      });
      return;
    }

    /* Each rect cycles FILL between colorRest and colorActive over
       the 1000ms cycle — a two-state toggle, not a fade. Opacity
       stays at 1.0 the whole time so nothing ever ghosts into the
       background. With 80ms stagger across 5 rects the "active"
       color chases through the logo over 320ms then loops. Peak
       at midpoint (offset 0.5) gives a clean back-and-forth swap. */
    const animations = rects.map((rect, i) => {
      const stagger = RECT_SEQUENCE[i].delay;
      return rect.animate(
        [
          { fill: colorRest },
          { fill: colorActive, offset: 0.5 },
          { fill: colorRest },
        ],
        {
          duration: 1000,
          iterations: Infinity,
          delay: stagger,
          easing: "ease-in-out",
        },
      );
    });

    return () => {
      animations.forEach((a) => a.cancel());
    };
  }, []);

  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox="0 0 40 40"
        aria-hidden
      >
        {RECT_SEQUENCE.map((r, i) => (
          <rect
            key={i}
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
            /* Initial fill matches the rest state so the first
               paint matches the trough of the swap cycle. */
            style={{ fill: colorRest }}
          />
        ))}
      </svg>
    </span>
  );
}
