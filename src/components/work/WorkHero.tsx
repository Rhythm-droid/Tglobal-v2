"use client";

import { useEffect, useRef } from "react";
import { MeshGradient } from "@paper-design/shaders-react";

import {
  AnimateIn,
  CharSplit,
  ScrubScale,
  WordReveal,
} from "@/components/primitives";
import { useMounted } from "@/lib/useMounted";

import { WORK_HERO_COLORS } from "./workPalette";

/**
 * WorkHero — the cinematic open for /work.
 *
 * Dark ink-black slab with a brand-violet Spotlight that follows the
 * cursor. The headline pairs Albert Sans with one italic Instrument
 * Serif accent word ("ships."), mirroring the homepage's "Friction"
 * treatment so the brand language stays continuous.
 *
 * Composition:
 *   • Spotlight wraps the section — cursor light is the only ambient.
 *   • Eyebrow ("N° 01 — SELECTED WORK") — mono micro-copy, animates in.
 *   • CharSplit headline — character cascade on mount.
 *   • WordReveal subhead — tricolon "Eight clients. Six industries..."
 *   • ScrubScale wraps the whole inner block so the hero recedes (scale
 *     + fade) as the user scrolls into the industry strip — same camera-
 *     pulling-away feel as /about's hero exit.
 *
 * No CTA, no scroll cue, no preview stats — the spec keeps the hero
 * intentionally clean. The next section carries the connector.
 */
export default function WorkHero() {
  /* Gate the shader behind a mounted check so SSR renders the static
     ink-black background and the client hydrates the WebGL canvas
     after first paint. Identical pattern to AboutHero — avoids
     hydration mismatch on the shader's internal canvas state. */
  const mounted = useMounted();
  const sectionRef = useRef<HTMLElement>(null);

  /* Cursor-light tracking — exact same RAF-throttled pattern as the
     Spotlight primitive, but inlined so the spotlight overlay can sit
     in our chosen z-stack position (LAYER 2, above the mesh shader
     but below the content). Spotlight as a wrapper would have placed
     the overlay BENEATH the mesh in DOM order, hiding the cursor
     light beneath the aurora. Inlining lets us order layers precisely. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let rafId: number | null = null;
    let pendingX = -9999;
    let pendingY = -9999;

    function update() {
      el!.style.setProperty("--spotlight-x", `${pendingX}px`);
      el!.style.setProperty("--spotlight-y", `${pendingY}px`);
      rafId = null;
    }
    function handleMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      pendingX = e.clientX - rect.left;
      pendingY = e.clientY - rect.top;
      if (rafId === null) rafId = requestAnimationFrame(update);
    }
    function handleLeave() {
      pendingX = -9999;
      pendingY = -9999;
      if (rafId === null) rafId = requestAnimationFrame(update);
    }
    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-foreground text-background min-h-[88svh] flex items-center"
      style={
        {
          "--spotlight-x": "-9999px",
          "--spotlight-y": "-9999px",
        } as React.CSSProperties
      }
    >
      {/* ── LAYER 0: Mesh-gradient ambient shader ───────────────────
          Slow morphing aurora behind everything else. Speed 0.22 is
          deliberately tortoise-pace — the shader should feel like
          weather, not motion. distortion 0.55 + swirl 0.4 keeps the
          stops in motion without ever resolving to a single shape.
          maxPixelCount caps the canvas resolution on retina so the
          GPU cost stays predictable on mobile. */}
      {mounted ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[0]"
        >
          <MeshGradient
            style={{ width: "100%", height: "100%" }}
            colors={[...WORK_HERO_COLORS]}
            distortion={0.55}
            swirl={0.4}
            grainMixer={0.28}
            grainOverlay={0.14}
            speed={0.22}
            maxPixelCount={1_440_000}
          />
        </div>
      ) : null}

      {/* ── LAYER 1: Vignette scrim ──────────────────────────────────
          Darkens the corners + the bottom so the shader never fights
          the headline contrast. Top stays brighter so the violet bloom
          shows. Bottom fades to flat ink so the section's bottom edge
          connects cleanly with the white industry strip beneath. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 35%, rgba(3,2,11,0) 0%, rgba(3,2,11,0.35) 55%, rgba(3,2,11,0.85) 90%, rgba(3,2,11,1) 100%)",
        }}
      />

      {/* ── LAYER 2: Cursor spotlight ───────────────────────────────
          Violet radial-gradient that follows the cursor — sits ABOVE
          the mesh and scrim so the cursor light actually shows on top
          of the aurora. screen blend mode keeps the light additive,
          never darkening. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "radial-gradient(680px circle at var(--spotlight-x) var(--spotlight-y), rgba(189, 112, 246, 0.26), transparent 70%)",
          mixBlendMode: "screen",
          willChange: "background",
        }}
      />
      <ScrubScale
        scaleTo={0.94}
        opacityTo={0.55}
        offset={["start start", "end start"]}
        className="relative z-[2] w-full"
      >
        <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20 pt-32 pb-20 sm:pt-40 sm:pb-28 lg:pt-48 lg:pb-32">
          <AnimateIn y={10}>
            <p
              className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.22em] text-background/55"
              style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
            >
              N° 01 — Selected work
            </p>
          </AnimateIn>

          {/* Headline — split into two pieces so the italic accent word
              ("ships.") sits on its own line on narrow viewports but
              hugs the preceding text on wide ones. CharSplit handles the
              cascade reveal for "Work that"; the italic gets a manual
              fade so the two timings sync. */}
          <h1
            className="mt-6 max-w-[18ch] font-medium leading-[0.98] text-background"
            style={{
              fontSize: "clamp(56px, 9.2vw, 144px)",
              letterSpacing: "-0.055em",
            }}
          >
            <CharSplit text="Work that" as="span" stagger={0.03} duration={0.7} />{" "}
            <span
              className="italic text-background"
              style={{
                fontFamily: "var(--font-instrument-serif), Georgia, serif",
                fontWeight: 400,
              }}
            >
              <AnimateIn y={0} delay={0.45} className="inline-block">
                <span>ships.</span>
              </AnimateIn>
            </span>
          </h1>

          <div className="mt-10 max-w-2xl">
            <WordReveal
              text="Ten clients. Nine industries. Three continents. Each one shipped to production."
              as="p"
              className="text-lg sm:text-xl lg:text-2xl font-normal leading-snug text-background/78"
              stagger={0.045}
              duration={0.55}
              yOffset={14}
            />
          </div>

          {/* Editorial corner mark — bottom-right index, mirrors the
              "N° 01" eyebrow with the literal page count. Pure decoration,
              aria-hidden because it adds nothing for screen readers. */}
          <div
            aria-hidden
            className="mt-20 sm:mt-28 flex items-end justify-between gap-6 border-t border-background/12 pt-6"
          >
            <p
              className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-background/45"
              style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
            >
              /work · case studies index
            </p>
            <p
              className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-background/45 tabular-nums"
              style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
            >
              10 entries · 9 sectors · 2024–2025
            </p>
          </div>
        </div>
      </ScrubScale>
    </section>
  );
}
