"use client";

import { useEffect, useState } from "react";

import { MeshGradient } from "@paper-design/shaders-react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import MagneticPill from "@/components/primitives/MagneticPill";
import MaskReveal from "@/components/primitives/MaskReveal";
import ScrubScale from "@/components/primitives/ScrubScale";
import { useInView } from "@/lib/useInView";

import { HERO_COLORS } from "./palette";

/* CTA — billboard close that mirrors the hero.
   ─────────────────────────────────────────────────────────────
   Previous attempts: left/right split with a body column +
   two equal CTAs. That works for content sections but NOT for
   a closing CTA — splits dilute the funnel, equal CTAs split
   the action, body copy in a side column competes with the
   headline.

   Premium closing CTAs (Linear, Stripe, Vercel, Apple) all use
   the same template: centred single column, short headline,
   one dominant CTA, generous breathing room. This rebuild
   adopts that template AND mirrors the hero's centred axis so
   the page closes the loop it opened.

   Structure (top → bottom, all centred):
     • Editorial label   (Nº 05 · Working together)
     • Massive headline  (9 words, italic typewriter accent)
     • Body line         (narrow, one sentence)
     • Primary CTA       (Start a sprint, dominant)
     • Secondary link    (View work →, demoted text link)

   Background: same hero MeshGradient (page bookends on one
   instrument) PLUS a strong centred radial bloom that pulls
   the eye straight to the headline. */

const ACCENT_CYCLE = ["actually", "really", "finally", "genuinely"] as const;

function TypewriterAccent() {
  const [i, setI] = useState(0);
  const [text, setText] = useState<string>(ACCENT_CYCLE[0]);
  const [phase, setPhase] = useState<"hold" | "delete" | "type" | "wait">("hold");

  // Phase machine — `hold` → `delete` (per-char) → `wait` (advance
  // index) → `type` (per-char) → `hold`. Each phase schedules ONE
  // timer to transition to the next; all timing constants are
  // local to the branch so tuning one phase doesn't touch others.
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (phase === "hold") {
      timeout = setTimeout(() => setPhase("delete"), 2400);
    } else if (phase === "delete") {
      if (text.length > 0) {
        timeout = setTimeout(() => setText((t) => t.slice(0, -1)), 38);
      } else {
        timeout = setTimeout(() => setPhase("wait"), 240);
      }
    } else if (phase === "wait") {
      timeout = setTimeout(() => {
        setI((n) => (n + 1) % ACCENT_CYCLE.length);
        setPhase("type");
      }, 80);
    } else if (phase === "type") {
      const next = ACCENT_CYCLE[i];
      if (text.length < next.length) {
        timeout = setTimeout(
          () => setText(next.slice(0, text.length + 1)),
          85,
        );
      } else {
        timeout = setTimeout(() => setPhase("hold"), 0);
      }
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [phase, text, i]);

  return (
    <span
      className="italic text-[#c5baff]"
      style={{
        fontFamily: "var(--font-instrument-serif), Georgia, serif",
        whiteSpace: "nowrap",
        // MaskReveal swaps text whitespace for `paddingRight: 0.22em`
        // on each word span, so the leading space in " ship it." is
        // dropped — the accent and "ship" collide ("finallyship").
        // Matching that padding here puts the space back without
        // depending on whitespace nodes that MaskReveal strips.
        paddingRight: "0.22em",
      }}
    >
      {text || "\u00A0"}
    </span>
  );
}

export default function AboutCTA() {
  const [shaderRef, shaderInView] = useInView<HTMLElement>({
    rootMargin: "300px",
    threshold: 0,
  });

  return (
    <section
      ref={shaderRef}
      aria-labelledby="about-cta-heading"
      /* min-h-[100svh] (not h-[100svh]) — the section is sized to
         AT LEAST one viewport but allowed to grow when the content
         exceeds it (short-viewport cases: landscape phones, very
         tight zoom levels, accessibility text-size overrides).
         Without this the section would clip the CTA pill on
         iPhone SE landscape (667×375). Vertical centering on
         flex still places everything mid-frame at typical
         viewports, so the billboard read is preserved. */
      className="relative isolate flex min-h-[100svh] w-full items-center justify-center overflow-hidden py-20 sm:py-24 lg:py-28"
      style={{ background: "var(--color-ink)" }}
    >
      {/* ── Layer 0: Hero-palette MeshGradient ─────────────────
          Same instrument as the hero so the page bookends on
          one visual motif. Paused entirely when off-screen. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[0]">
        <MeshGradient
          style={{ width: "100%", height: "100%" }}
          colors={[...HERO_COLORS]}
          distortion={0.6}
          swirl={0.45}
          grainMixer={0.32}
          grainOverlay={0.16}
          speed={shaderInView ? 0.32 : 0}
          maxPixelCount={1_440_000}
        />
      </div>

      {/* ── Layer 1: Vertical vignette ────────────────────────
          Darker at top + bottom edges, lighter in the type
          band. Mirrors the hero's scrim so the dark beats
          read as the same composition logic. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(14,10,30,0.55) 0%, rgba(14,10,30,0) 22%, rgba(14,10,30,0) 78%, rgba(14,10,30,0.6) 100%)",
        }}
      />

      {/* ── Layer 2: Centred focal bloom ──────────────────────
          Strong lavender radial glow centred on the headline.
          Pulls the eye to the type — the whole point of a
          closing CTA. Larger and more saturated than the side-
          biased bloom of the previous attempt because the
          composition is now centred. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 48%, rgba(189,112,246,0.32) 0%, rgba(107,92,231,0.14) 40%, rgba(14,10,30,0) 75%)",
        }}
      />

      {/* ── Layer 3: Content ───────────────────────────────────
          Single centred column. Everything stacks vertically,
          everything is centre-aligned, every element points the
          eye at the next one down ending at the primary CTA. */}
      {/* Container is sized so the longest accent variant
          ("genuinely", 9 letters) still keeps "We will [accent]
          ship it." on a SINGLE line at the chosen font cap.
          Was max-w-[1100px] which caused the line to wrap on
          longer accents — flipping the headline between 2 and
          3 lines as the typewriter cycled. */}
      <div className="relative z-[3] mx-auto flex w-full max-w-[1280px] flex-col items-center px-6 text-center sm:px-8 lg:px-14 xl:px-20">
        <p
          className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.22em] text-white/55"
          style={{
            fontFamily:
              "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          <span className="tabular-nums">№ 05</span>
          <span aria-hidden className="h-px w-8 bg-white/30" />
          <span>Working together</span>
        </p>

        <ScrubScale scaleTo={1.03} opacityTo={1}>
          <h2
            id="about-cta-heading"
            // No per-element max-w — the container above handles
            // the outer bound. Font cap reduced from 124px so the
            // longest line ("We will genuinely ship it." = 26
            // chars) fits the container width on a single line
            // at every viewport, locking the layout to 2 lines.
            className="mt-6 font-medium leading-[1] text-white sm:mt-8"
            style={{
              fontSize: "clamp(36px, 5vw, 86px)",
              letterSpacing: "-0.045em",
            }}
          >
            <MaskReveal
              text="Bring the idea."
              as="span"
              className="block"
              stagger={0.05}
              duration={0.9}
            />
            <span className="mt-1 inline-block">
              <MaskReveal
                text="We will "
                as="span"
                className="inline"
                stagger={0.05}
                duration={0.9}
              />
              <TypewriterAccent />
              {/* Forced line break ONLY below sm (640px). Below that
                  width "We will [accent] ship it." cannot fit one
                  line even at the floor font size (36px × 26 chars
                  ≈ 449px vs ~327px available on iPhone SE) — so
                  the wrap point would otherwise flip between line 2
                  and line 3 as the accent cycled through different
                  lengths. The br forces a CONSISTENT 3-line layout
                  on mobile, while sm+ stays 2 lines as designed. */}
              <br className="sm:hidden" />
              <MaskReveal
                text=" ship it."
                as="span"
                className="inline"
                stagger={0.05}
                duration={0.9}
              />
            </span>
          </h2>
        </ScrubScale>

        <p className="mt-7 max-w-[52ch] text-balance text-base leading-[1.55] text-white/65 sm:mt-10 sm:text-lg lg:text-xl">
          Send the goal, the constraint, and what needs to be true after
          the first sprint. You will get a direct next step within 48 hours.
        </p>

        <div className="mt-9 flex flex-col items-center gap-5 sm:mt-12">
          <MagneticPill
            href="/#talk-to-us"
            variant="primary"
            cursorText="let's go"
          >
            Start a sprint <ArrowRight aria-hidden size={18} />
          </MagneticPill>
          <Link
            href="/work"
            // data-cursor-text triggers the pill cursor with this label.
            // Same opt-in mechanism MagneticPill uses internally.
            data-cursor-text="see it"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/65 transition-colors hover:text-white"
            style={{ letterSpacing: "-0.01em" }}
          >
            View work <ArrowUpRight aria-hidden size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
