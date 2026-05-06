"use client";

/**
 * BorderBeam — animated light traveling around a card's border.
 *
 * The "magicui beam" pattern: a thin glowing line that orbits the
 * perimeter of an element, drawing the eye to the most important
 * card on a page (e.g. the featured case study tile on /work).
 *
 * Implementation:
 *   • A `::after`-style pseudo via an absolutely-positioned div with
 *     a conic-gradient background, masked by `mask-composite: subtract`
 *     so only the rim shows. The conic gradient rotates via a CSS
 *     keyframe animation at a configurable duration.
 *   • Pure CSS — no JS per frame. The browser's compositor handles
 *     the rotation entirely on the GPU.
 *
 * Why conic-gradient + mask, not SVG stroke-dasharray:
 *   conic-gradient + mask = one DOM node, one paint layer, GPU-only.
 *   SVG stroke-dashoffset = animated SVG attribute, paint per frame
 *   on CPU, slower for non-trivial border-radius. The conic approach
 *   is the standard for this exact pattern (magicui, aceternity).
 *
 * Why we don't use `useReducedMotion`:
 *   The animation is decorative, not informational, and at the chosen
 *   speed (8s per orbit) it's slow enough to be ambient rather than
 *   distracting. Users who disable motion would see a static beam at
 *   one rotation point — which still works as a "highlight" affordance.
 *   We do, however, respect `prefers-reduced-motion` via globals.css's
 *   blanket `animation: none` rule, which kills the rotation and leaves
 *   the static gradient — equivalent in meaning.
 *
 * Composition:
 *   Wrap a `MagicCard` or any rounded container. The beam sits on top
 *   of the card's existing border, so don't add a border on the wrapped
 *   element to avoid visual doubling.
 *
 * Usage:
 *   <BorderBeam>
 *     <MagicCard>...featured content...</MagicCard>
 *   </BorderBeam>
 *
 *   <BorderBeam duration={6} colorStart="#bd70f6" colorEnd="#4b28ff">
 *     ...
 *   </BorderBeam>
 */

import { cn } from "@/lib/cn";

interface BorderBeamProps {
  children: React.ReactNode;
  /** Orbit duration in seconds. Slower = more ambient. */
  duration?: number;
  /** Beam color at the leading edge. */
  colorStart?: string;
  /** Beam color at the trailing edge — the gradient fades from start to end. */
  colorEnd?: string;
  /** Border thickness in pixels. */
  size?: number;
  /** Border radius in pixels — match the wrapped card's radius for clean clipping. */
  borderRadius?: number;
  /** Optional className passed through to the outer wrapper. */
  className?: string;
}

export default function BorderBeam({
  children,
  duration = 8,
  colorStart = "#bd70f6",
  colorEnd = "#4b28ff",
  size = 1.5,
  borderRadius = 24,
  className,
}: BorderBeamProps) {
  return (
    <div
      className={cn("relative", className)}
      style={{ borderRadius: `${borderRadius}px` }}
    >
      {/*
        Beam ring layer.
        ─────────────────────────────────────────────────────────────
        How the mask trick works:
          1. The element is filled with a `conic-gradient` that fades
             from `colorStart` to transparent. This is the "beam".
          2. We then mask it so ONLY the border ring is visible:
               • mask-image #1: a solid black rectangle (the full element).
               • mask-image #2: a black rectangle inset by `size` pixels.
               • mask-composite: subtract → result is the rim alone.
          3. A CSS keyframe rotates the element 360° over `duration`s,
             so the conic-gradient orbits around the border.

        `pointer-events: none` so the beam doesn't intercept clicks.
        `animate-spin-slow` is defined inline via `style.animation` to
        keep the duration prop dynamic.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: `${borderRadius}px`,
          padding: `${size}px`,
          background: `conic-gradient(from 0deg, transparent 0%, ${colorStart} 25%, ${colorEnd} 50%, transparent 75%)`,
          /* The mask trick — `mask-composite: exclude` (or `subtract`)
             leaves only the area outside the inner rectangle. */
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
          animation: `border-beam-spin ${duration}s linear infinite`,
        }}
      />

      {/* Inline keyframes — kept local so we don't pollute globals.css
          with a single-use animation. The keyframe name is unique
          enough to not clash with anything else. */}
      <style>{`
        @keyframes border-beam-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {children}
    </div>
  );
}
