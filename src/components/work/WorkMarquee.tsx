"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface WorkMarqueeProps {
  /** Tokens to display in the marquee — interspersed with a separator. */
  items: readonly string[];
  /** Optional className for the wrapping section. */
  className?: string;
  /** Direction the marquee scrolls (driven by GSAP base loop). */
  direction?: "left" | "right";
  /** Base scroll speed in seconds for one full loop. Larger = slower. */
  speed?: number;
  /** Variant — "ink" sits on dark surfaces, "paper" on light. */
  variant?: "ink" | "paper";
}

/**
 * WorkMarquee — kinetic typography divider between major sections.
 *
 * Codrops 2026 pattern adapted: a continuously-scrolling marquee where
 * the BASE speed is constant (GSAP linear tween, looped), but page-
 * scroll velocity DISTORTS the marquee in real time — fast scroll adds
 * skew + boosts the marquee speed in the scroll direction, then eases
 * back. Reads as if the marquee is on a parallax rail responding to
 * the reader's energy.
 *
 * Why this earns a place:
 *   • Existing primitives don't have a marquee; this is the one new
 *     primitive added in v2 (everything else reuses what's there).
 *   • Acts as a visual breath between sections — gives the eye a
 *     resting "non-content" beat after dense grids and metrics.
 *   • Carries brand language: dot-separated SECTION/CLIENT/OUTCOME
 *     tokens (e.g. "MedCollect · 90% FPY · Healthcare · Optum").
 *   • prefers-reduced-motion: the base loop pauses and the velocity
 *     distortion never registers, so reduced-motion users see a
 *     static row of tokens. Same content, no movement.
 */
export default function WorkMarquee({
  items,
  className = "",
  direction = "left",
  speed = 30,
  variant = "ink",
}: WorkMarqueeProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const baseTweenRef = useRef<gsap.core.Tween | null>(null);

  /* Base loop — continuous horizontal scroll using a duplicated track.
     We render the items twice in the JSX and animate xPercent from 0
     to -50 (half the track width) on a linear, infinite loop. When
     the first copy moves past the left edge, the second copy is
     already in position to fill the right edge, so the loop is
     seamless without runtime layout math. */
  useGSAP(
    () => {
      if (typeof window === "undefined") return;
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }
      const track = trackRef.current;
      if (!track) return;

      const from = direction === "left" ? 0 : -50;
      const to = direction === "left" ? -50 : 0;

      baseTweenRef.current = gsap.fromTo(
        track,
        { xPercent: from },
        {
          xPercent: to,
          duration: speed,
          ease: "none",
          repeat: -1,
        },
      );

      return () => {
        baseTweenRef.current?.kill();
        baseTweenRef.current = null;
      };
    },
    { scope: wrapperRef },
  );

  /* Velocity-driven speed boost + skew. Independent of the base loop
     so each effect can be tuned without affecting the other. ST.create
     onUpdate reads scroll velocity and:
       • Boosts the base tween's timeScale up to ~3x in the scroll
         direction (or reverses it briefly on opposite scroll).
       • Applies a skewX of ±4° proportional to velocity, eased back.
     Both effects ease back to 1x / 0deg when scroll settles. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const track = trackRef.current;
    if (!track) return;

    const trigger = ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: "top bottom",
      end: "bottom top",
      onUpdate(self) {
        const v = self.getVelocity() / 1000; // ~-2 .. 2 typical
        const clamped = gsap.utils.clamp(-2.5, 2.5, v);
        /* Direction multiplier so a "left" marquee speeds up on
           downward scroll, and a "right" marquee speeds up on upward
           scroll. Subtle but intentional. */
        const dirMult = direction === "left" ? 1 : -1;
        if (baseTweenRef.current) {
          gsap.to(baseTweenRef.current, {
            timeScale: 1 + Math.abs(clamped) * dirMult * 0.6,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
        gsap.to(track, {
          skewX: clamped * 1.6 * dirMult,
          duration: 0.5,
          ease: "power3.out",
          overwrite: "auto",
        });
      },
    });

    return () => trigger.kill();
  }, [direction]);

  const inkClasses =
    "bg-foreground text-background border-y border-background/10";
  const paperClasses =
    "bg-background text-foreground border-y border-border";

  return (
    <section
      aria-hidden
      ref={wrapperRef}
      className={`relative overflow-hidden ${variant === "ink" ? inkClasses : paperClasses} ${className}`}
    >
      <div
        ref={trackRef}
        className="flex whitespace-nowrap py-6 sm:py-8 will-change-transform"
        style={{ transformOrigin: "center" }}
      >
        {/* Track is rendered twice end-to-end so the loop seamlessly
            wraps. Each token is followed by an Instrument Serif accent
            dot — italic, accent-violet — to break up the mono cadence. */}
        {[0, 1].map((copyIdx) => (
          <div key={copyIdx} className="flex shrink-0 items-center">
            {items.map((token, idx) => (
              <span
                key={`${copyIdx}-${idx}`}
                className="inline-flex items-center"
              >
                <span
                  className="px-6 sm:px-8 text-2xl sm:text-3xl lg:text-4xl font-medium tracking-[-0.02em]"
                  style={{ letterSpacing: "-0.025em" }}
                >
                  {token}
                </span>
                <span
                  aria-hidden
                  className="text-2xl sm:text-3xl lg:text-4xl italic select-none"
                  style={{
                    fontFamily: "var(--font-instrument-serif), Georgia, serif",
                    color: "var(--color-accent-violet)",
                    opacity: 0.85,
                    transform: "translateY(-2px)",
                  }}
                >
                  ·
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
