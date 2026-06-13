"use client";

import Link from "next/link";
import { MeshGradient } from "@paper-design/shaders-react";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import MagneticPill from "@/components/primitives/MagneticPill";
import MaskReveal from "@/components/primitives/MaskReveal";
import RotatingWord from "@/components/primitives/RotatingWord";
import ScrubScale from "@/components/primitives/ScrubScale";
import { useInView } from "@/lib/useInView";

import { WORK_HERO_COLORS } from "./workPalette";

/* Words the rotating accent cycles through in the CTA headline:
   "Want to be the {next/first/biggest/weirdest/fastest} case study?"
   Order is deliberate — "next" is the safe opener; "weirdest" is the
   delight beat that keeps people watching the rotation. Natural width,
   no pinning — the line shifting as words swap IS the motif (same
   decision as the About CTA's typewriter). */
const ROTATING_WORDS = ["next", "first", "biggest", "weirdest", "fastest"] as const;

/**
 * WorkCTA — "N° 08 — What's next", the billboard close.
 *
 * Follows the site's closing-section pattern (the About CTA is the
 * reference): the page BOOKENDS on the same light MeshGradient as its
 * hero — /work opens on WORK_HERO_COLORS and closes on it. Centred
 * single column on the luminous lavender wash: editorial № label,
 * massive ink headline with the rotating italic accent in the soft
 * violet (#6b5ce7) the canvas family uses, body line, one dominant
 * MagneticPill, one demoted text link. Vignette ramps to white at the
 * bottom so the section meets the footer with no seam.
 */
export default function WorkCTA() {
  const [shaderRef, shaderInView] = useInView<HTMLElement>({
    rootMargin: "300px",
    threshold: 0,
  });

  return (
    <section
      ref={shaderRef}
      aria-labelledby="cta-heading"
      className="relative isolate flex min-h-[100svh] w-full items-center justify-center overflow-hidden py-20 sm:py-24 lg:py-28"
      style={{ background: "var(--color-paper-alt, #f4eef9)" }}
    >
      {/* ── Layer 0: hero-palette MeshGradient — the bookend. Paused
          entirely when off-screen. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[0]">
        <MeshGradient
          style={{ width: "100%", height: "100%" }}
          colors={[...WORK_HERO_COLORS]}
          distortion={0.6}
          swirl={0.45}
          grainMixer={0.32}
          grainOverlay={0.16}
          speed={shaderInView ? 0.32 : 0}
          maxPixelCount={1_440_000}
        />
      </div>

      {/* ── Layer 1: vertical vignette — blends from the white Voices
          section above, ramps to white below so the footer meets the
          section with no visible seam. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 22%, rgba(255,255,255,0) 65%, rgba(255,255,255,0.7) 92%, rgba(255,255,255,1) 100%)",
        }}
      />

      {/* ── Layer 2: centred focal bloom — pulls the eye to the
          headline. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 48%, rgba(189,112,246,0.28) 0%, rgba(107,92,231,0.12) 40%, rgba(244,238,249,0) 75%)",
        }}
      />

      {/* ── Layer 3: content — single centred column. */}
      <div className="relative z-[3] mx-auto flex w-full max-w-[1280px] flex-col items-center px-6 text-center sm:px-8 lg:px-14 xl:px-20">
        <p
          className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.22em] text-foreground-mid"
          style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
        >
          <span className="tabular-nums">№ 08</span>
          <span aria-hidden className="h-px w-8 bg-foreground-mid/40" />
          <span>What&apos;s next</span>
        </p>

        <ScrubScale scaleTo={1.03} opacityTo={1}>
          <h2
            id="cta-heading"
            className="mt-6 font-medium leading-[1.05] text-foreground sm:mt-8"
            style={{ fontSize: "clamp(34px, 7vw, 96px)", letterSpacing: "-0.045em" }}
          >
            <MaskReveal
              text="Want to be the"
              as="span"
              className="block whitespace-nowrap"
              stagger={0.05}
              duration={0.9}
            />
            <span className="mt-1 block whitespace-nowrap">
              <span
                className="italic text-[#6b5ce7]"
                style={{
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                  fontWeight: 400,
                  paddingRight: "0.18em",
                }}
              >
                <RotatingWord words={ROTATING_WORDS} interval={2400} duration={0.55} />
              </span>
              <MaskReveal
                text=" case study?"
                as="span"
                className="inline"
                stagger={0.05}
                duration={0.9}
              />
            </span>
          </h2>
        </ScrubScale>

        <p className="mt-7 max-w-[60ch] text-balance text-base leading-[1.55] text-foreground-mid sm:mt-10 sm:text-lg lg:text-xl">
          You scrolled through ten engagements — end of the loop, start of
          yours. Send a one-paragraph problem statement and a plan comes
          back inside 48 hours.
        </p>

        <div className="mt-9 flex flex-col items-center gap-5 sm:mt-12">
          <MagneticPill
            href="/#talk-to-us"
            variant="primary"
            strength={0.22}
            cursorText="Let's talk"
            ariaLabel="Start a project — go to the contact form"
          >
            Start a project <ArrowRight aria-hidden size={18} />
          </MagneticPill>
          <Link
            href="/process"
            data-cursor-text="the method"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground-mid transition-colors hover:text-foreground"
            style={{ letterSpacing: "-0.01em" }}
          >
            See how we work <ArrowUpRight aria-hidden size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
