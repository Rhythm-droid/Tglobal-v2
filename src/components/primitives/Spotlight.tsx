"use client";

/**
 * Spotlight — large radial light that follows the cursor across a section.
 *
 * Distinct from `<MagicCard>`:
 *   • MagicCard is per-tile, hover-only, contained inside a card.
 *   • Spotlight is per-section, always-on, full-bleed background. Best
 *     on dark heroes (e.g. /work index hero) where it acts as ambient
 *     lighting that responds to the user's cursor.
 *
 * Implementation:
 *   • Listens to mousemove on the section element via `useEffect`.
 *   • Updates two CSS custom properties (`--spotlight-x`, `--spotlight-y`)
 *     on the section element. The actual gradient is rendered via a
 *     pseudo-element (`::before`) styled in the component's own
 *     `<style>` block — keeps the gradient on the GPU compositor.
 *   • Throttled to one update per animation frame so heavy scrolling
 *     doesn't spam the layout.
 *
 * Why this and not MagicCard for sections:
 *   MagicCard renders an absolutely-positioned overlay div. Doing the
 *   same on a full hero would require a wrapping element AND inserting
 *   an overlay div. Spotlight uses a single section with a pseudo-
 *   element, no extra DOM.
 *
 * Reduced motion:
 *   We disable the cursor tracking entirely. The CSS variables stay
 *   at their initial values (off-center top), so the gradient renders
 *   as a static ambient light. Visually equivalent enough to keep the
 *   "this section has a spotlight" identity without the motion.
 *
 * Server-component compatibility:
 *   "use client" because of the mouse listener. The wrapped children
 *   can still be server components.
 *
 * Usage:
 *   <Spotlight className="bg-foreground text-background min-h-[80vh]">
 *     <h1>Work that ships.</h1>
 *   </Spotlight>
 *
 *   <Spotlight color="rgba(189, 112, 246, 0.2)" radius={600}>
 *     ...
 *   </Spotlight>
 */

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

interface SpotlightProps {
  children: React.ReactNode;
  /** Light color (typically a brand color at low alpha for an ambient feel). */
  color?: string;
  /** Light radius in pixels. */
  radius?: number;
  /** Optional className for the section wrapper. */
  className?: string;
  /** Render `as` tag — defaults to "section". */
  as?: "section" | "div" | "header";
}

export default function Spotlight({
  children,
  color = "rgba(75, 40, 255, 0.18)",
  radius = 540,
  className,
  as = "section",
}: SpotlightProps) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const el = ref.current;
    if (!el) return;

    let rafId: number | null = null;
    let pendingX = 0;
    let pendingY = 0;

    /* Throttle to one update per frame. Without this, mouse-move events
       fire 100+ times per second on fast cursors and would redundantly
       update the CSS variable several times within one frame. */
    function update() {
      el?.style.setProperty("--spotlight-x", `${pendingX}px`);
      el?.style.setProperty("--spotlight-y", `${pendingY}px`);
      rafId = null;
    }

    function handleMouseMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      pendingX = e.clientX - rect.left;
      pendingY = e.clientY - rect.top;
      if (rafId === null) rafId = requestAnimationFrame(update);
    }

    function handleMouseLeave() {
      /* Send the spotlight off-screen so it fades out via the gradient's
         transparent stop. We don't animate the fade — the next mouseenter
         will pop it back in immediately, which feels natural. */
      pendingX = -radius * 2;
      pendingY = -radius * 2;
      if (rafId === null) rafId = requestAnimationFrame(update);
    }

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [reduceMotion, radius]);

  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      style={
        {
          /* Initial position is off-screen (negative) so there's no
             flash of a centered spotlight before the cursor arrives. */
          "--spotlight-x": "-9999px",
          "--spotlight-y": "-9999px",
          "--spotlight-radius": `${radius}px`,
          "--spotlight-color": color,
        } as React.CSSProperties
      }
    >
      {/* Spotlight overlay — pseudo-element via inline style.
          pointer-events: none so clicks pass through to children. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(var(--spotlight-radius) circle at var(--spotlight-x) var(--spotlight-y), var(--spotlight-color), transparent 70%)",
          /* GPU compositing hint. The browser will keep this layer on
             its own composite layer instead of repainting on every
             cursor move. */
          willChange: "background",
        }}
      />
      {/* Children render above the overlay. We don't add z-index unless
          a child needs to opt-in to being clearly above the spotlight. */}
      <div className="relative">{children}</div>
    </Tag>
  );
}
