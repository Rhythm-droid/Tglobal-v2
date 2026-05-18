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
import { useId } from "react";

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
  /* Per-instance ID for the @property + keyframes scoping. Multiple
     BorderBeams on the same page would otherwise share one --angle
     custom property and animate in lockstep at the same speed —
     here each instance owns its own angle variable, so durations can
     differ per beam without cross-talk. */
  const id = useId().replace(/:/g, "");
  const angleVar = `--beam-angle-${id}`;
  const keyframeName = `border-beam-orbit-${id}`;

  return (
    <div
      className={cn("relative", className)}
      style={{ borderRadius: `${borderRadius}px` }}
    >
      {/* Children FIRST — the wrapped card paints normally underneath. */}
      {children}

      {/*
        Beam ring layer — sits ON TOP of children, but the mask strips
        out everything except the 1.5px rim so the card content stays
        visible. Only the animated rim ever overlays the card.
        ─────────────────────────────────────────────────────────────
        How this version works (rewritten 2026-05):
          1. A CSS `@property` declares `--beam-angle-XXX` as an
             interpolatable <angle> type. Without @property, custom
             properties default to <string>, which can't animate
             between values — the keyframes would snap to "to" state
             instead of smoothly orbiting.
          2. The conic gradient reads `from var(--beam-angle-XXX)`,
             rotating the gradient INSIDE the element. The element
             itself stays static.
          3. The mask (two solid-black gradients composited XOR) clips
             everything except the 1.5px rim. Because the ELEMENT is
             static, the rim stays on the card border — only the
             violet→purple gradient orbits within it.

        ⚠️ Why the old "transform: rotate" approach was broken:
        Rotating the ENTIRE element rotates the mask too, so on a
        rectangular card the masked silhouette spins — bleeding the
        rim out diagonally past the card. This was fine on a square
        card but visibly wrong on the wider WorkFeatured tile.
        Animating the gradient's `from` angle instead keeps the mask
        aligned to the card edges at every frame.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: `${borderRadius}px`,
          padding: `${size}px`,
          background: `conic-gradient(from var(${angleVar}, 0deg), transparent 0%, ${colorStart} 25%, ${colorEnd} 50%, transparent 75%)`,
          /* Mask trick — two black gradients, one clipped to
             content-box and one to the default border-box, composited
             with XOR/exclude so only the rim remains.
             ⚠️ Gradient syntax matters: `linear-gradient(#000 0 0)`
             with two whitespace-separated `0` stops parses as broken
             in Next.js 16 + Chromium 130+. Use two color-stop pairs
             instead — `linear-gradient(#000, #000)` — which is the
             canonical "solid black" gradient. */
          WebkitMask:
            "linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)",
          maskComposite: "exclude",
          animation: `${keyframeName} ${duration}s linear infinite`,
        }}
      />

      {/* Inline @property + keyframes. The @property registration is
          essential — without it, the keyframes treat --beam-angle as
          a string and skip straight to the final value instead of
          interpolating, killing the rotation. */}
      <style>{`
        @property ${angleVar} {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }
        @keyframes ${keyframeName} {
          from { ${angleVar}: 0deg; }
          to { ${angleVar}: 360deg; }
        }
      `}</style>
    </div>
  );
}
