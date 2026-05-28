"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

import { AnimateIn } from "@/components/primitives";
import { useMounted } from "@/lib/useMounted";
import { PROCESS_STEPS } from "@/app/work/data";

/**
 * WorkProcessTeaser — bridge between the case studies and the metrics.
 *
 * Reads as a single editorial line: "Scope → Ship → Measure. That's it.
 * That's the playbook." Each of the three steps sits as a numbered card
 * on a horizontal flow; a scroll-driven progress line draws across them
 * as the user enters the section.
 *
 * Why it earns its place:
 *   • Grid answers WHAT we shipped. Metrics answer THE NUMBERS. This
 *     section answers HOW we ship — the missing connective tissue.
 *   • Keeps users in the /work narrative but seeds /process curiosity
 *     via a tail link, without dropping them out of the scroll.
 *   • Visually distinct from grid + metrics: dark slab with cream type,
 *     mirrors the hero/CTA bookends so the page reads as a 5-beat
 *     sonata rather than 7 unrelated sections.
 */
export default function WorkProcessTeaser() {
  const sectionRef = useRef<HTMLElement>(null);
  const mounted = useMounted();

  /* Scroll progress through this section, smoothed with a soft spring
     so the progress line "follows" with weight rather than snapping. */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
    mass: 0.4,
  });

  /* Maps scroll progress 0.2 → 0.8 to width 0 → 100% so the line
     starts drawing as the section enters viewport and finishes before
     it exits. The narrow range keeps the draw feel deliberate. */
  const lineScaleX = useTransform(smooth, [0.2, 0.8], [0, 1]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="process-teaser-heading"
      className="relative overflow-hidden bg-background text-foreground"
    >
      {/* LAYER 0 — Static lavender wash. Mimics the hero's WORK_HERO_
          COLORS palette (white → pale lavender → soft lavender →
          deeper lavender) via stacked radial gradients, so the
          playbook reads as a "second wave of light" matching the
          page's top-of-page bookend WITHOUT running a second WebGL
          shader. The hero already pins a MeshGradient for ~540svh of
          scroll, and running a second one here pushed the browser
          past its compositor budget — Playwright screenshot capture
          started timing out across most viewports. Static gradients
          have effectively zero GPU cost and produce a near-identical
          read. The mesh wash flows naturally into the metrics
          section below (paper-alt is a flat variant of the same hue
          family) so the seam feels intentional, not abrupt. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[0]"
        style={{
          background: [
            /* Top-left lavender bloom — deepest stop, anchors the eye */
            "radial-gradient(60% 45% at 18% 22%, #c5baff 0%, rgba(197, 186, 255, 0) 65%)",
            /* Bottom-right mid-blend — balances the composition */
            "radial-gradient(55% 40% at 78% 80%, #dcd1ff 0%, rgba(220, 209, 255, 0) 68%)",
            /* Centre soft wash — fills the middle without competing */
            "radial-gradient(70% 55% at 50% 55%, #ede4ff 0%, rgba(237, 228, 255, 0) 72%)",
            /* Base linear — top→bottom from very-pale to soft lavender */
            "linear-gradient(180deg, #f6f1ff 0%, #ede4ff 100%)",
          ].join(", "),
        }}
      />

      {/* Noise grain overlay — same SVG turbulence recipe as the
          card covers + featured dashboard mock. Mix-blend overlay
          at 6% opacity adds the editorial film-grain texture that
          the mesh-gradient's grainMixer provides natively. ~200
          bytes inline, no JS, no GPU cost. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[0]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: "240px 240px",
          opacity: 0.06,
          mixBlendMode: "overlay",
        }}
      />

      <div className="relative z-[1] mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20 py-20 sm:py-24 lg:py-28">
        <div className="flex items-baseline justify-between gap-6 mb-12 sm:mb-16">
          <p
            id="process-teaser-heading"
            className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.22em] text-foreground/55"
            style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
          >
            N° 05 — Playbook
          </p>
          <Link
            href="/process"
            className="hidden sm:inline-flex items-baseline gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/55 hover:text-foreground transition-colors focus-ring rounded-md"
            style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
          >
            Full method
            <span aria-hidden>→</span>
          </Link>
        </div>

        {/* Headline — repeats the same italic-accent treatment as the
            other sections so the page bookends cohere. Now sits on
            the lavender wash, so the headline ink reads cleanly
            against the soft background. */}
        <h2
          className="font-medium text-foreground leading-[1.02] max-w-4xl"
          style={{
            fontSize: "clamp(38px, 5.6vw, 80px)",
            letterSpacing: "-0.05em",
          }}
        >
          Scope. Ship.{" "}
          <span
            className="italic"
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontWeight: 400,
              color: "var(--color-primary)",
            }}
          >
            Measure.
          </span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg sm:text-xl text-foreground/75 leading-relaxed">
          That&apos;s the entire playbook. Every project you scrolled
          through ran on this loop.
        </p>

        {/* ── Steps row ──────────────────────────────────────────
            Three numbered cards laid out horizontally. The scroll-
            driven line below threads through them as the user enters
            the section, drawing left to right. */}
        <div className="relative mt-16 sm:mt-20">
          {/* Progress rail — full-width hairline behind the cards.
              The active fill (lineScaleX) draws across it driven by
              scroll progress. Origin-left so the scaleX(0..1) reads
              as a left→right draw. Hairline is foreground/15 now
              that the section sits on a light wash (was background/15
              when the section was ink). */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[34px] sm:top-[40px] h-px bg-foreground/15 z-0"
          />
          {mounted ? (
            <motion.div
              aria-hidden
              className="absolute left-0 top-[34px] sm:top-[40px] h-px right-0 origin-left z-0"
              style={{
                background:
                  "linear-gradient(90deg, var(--color-accent-violet) 0%, var(--color-primary) 100%)",
                scaleX: lineScaleX,
                boxShadow: "0 0 12px rgba(189, 112, 246, 0.55)",
                willChange: "transform",
              }}
            />
          ) : null}

          <ol className="relative z-[1] grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6 lg:gap-10">
            {PROCESS_STEPS.map((step, idx) => (
              <AnimateIn
                key={step.n}
                as="li"
                delay={idx * 0.1}
                y={16}
                duration={0.55}
              >
                <div className="flex flex-col gap-5">
                  {/* Step dot — sits on top of the progress rail so the
                      line appears to pass behind each step. The outer
                      ring now uses bg-background (white) so the dot
                      "cuts" through the lavender wash, framing the
                      violet pill inside. Ring border is foreground/15
                      to match the rail hairline. */}
                  <span
                    aria-hidden
                    className="inline-flex h-[68px] w-[68px] sm:h-[80px] sm:w-[80px] items-center justify-center rounded-full bg-background border border-foreground/15"
                  >
                    <span
                      className="inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(189, 112, 246, 0.18) 0%, rgba(75, 40, 255, 0.18) 100%)",
                        boxShadow:
                          "inset 0 0 0 1px rgba(189, 112, 246, 0.45)",
                      }}
                    >
                      <span
                        className="font-mono text-sm sm:text-base font-medium tabular-nums"
                        style={{
                          fontFamily:
                            "var(--font-mono), 'JetBrains Mono', monospace",
                          color: "var(--color-primary)",
                        }}
                      >
                        {step.n}
                      </span>
                    </span>
                  </span>

                  <div>
                    <h3
                      className="font-medium text-foreground leading-tight"
                      style={{
                        fontSize: "clamp(24px, 2.6vw, 36px)",
                        letterSpacing: "-0.035em",
                      }}
                    >
                      {step.title}
                    </h3>
                    <p className="mt-3 text-base sm:text-lg text-foreground/75 leading-relaxed max-w-xs">
                      {step.blurb}
                    </p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </ol>
        </div>

        {/* Mobile tail link — desktop has it in the section header */}
        <div className="mt-12 sm:hidden">
          <Link
            href="/process"
            className="inline-flex items-baseline gap-2 font-mono text-xs uppercase tracking-[0.22em] text-foreground/70 hover:text-foreground transition-colors focus-ring rounded-md"
            style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
          >
            See the full method
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
