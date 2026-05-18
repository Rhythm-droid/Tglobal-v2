"use client";

import { MagneticPill, RotatingWord } from "@/components/primitives";

/* Words the rotating accent cycles through in the CTA headline:
   "Want to be the {next/first/biggest/weirdest/fastest} case study?"
   Order is deliberate — "next" is the safe opener; "weirdest" is the
   delight beat that keeps people watching the rotation. */
const ROTATING_WORDS = ["next", "first", "biggest", "weirdest", "fastest"] as const;

/**
 * WorkCTA — the closing dark slab.
 *
 * Mirrors the hero — ink-black background, lavender blob top-right,
 * italic Instrument Serif accent word. The italic word here rotates
 * through {next/first/biggest/weirdest/fastest} via the existing
 * `RotatingWord` primitive (blur + letter cascade swap).
 *
 * The CTA pill is wrapped in `MagneticPill` so the button follows the
 * cursor inside its container — a single moment of delight at the
 * page's last beat. The hero deliberately had no CTA, so this section
 * is the singular conversion surface for the whole page.
 */
export default function WorkCTA() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="bg-background py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
        <div className="relative overflow-hidden rounded-[32px] bg-foreground text-background px-8 py-16 sm:px-14 sm:py-20 lg:px-20 lg:py-28">
          {/* Lavender blob — same language as the homepage CTA */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full opacity-45"
            style={{
              background: "var(--color-accent-violet)",
              filter: "blur(160px)",
            }}
          />
          {/* Secondary bloom — bottom-left for visual balance */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-40 h-[360px] w-[360px] rounded-full opacity-35"
            style={{
              background: "var(--color-primary)",
              filter: "blur(140px)",
            }}
          />

          <div className="relative max-w-4xl">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <p
                className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.22em] text-background/55"
                style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
              >
                N° 09 — What&apos;s next
              </p>
              {/* Scroll-cue line — acknowledges the reader's effort.
                  Editorial signal: the page recognizes that you've been
                  reading, and rewards it with a tighter pitch. */}
              <p
                className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-background/65"
                style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
              >
                · You scrolled through ten engagements
              </p>
            </div>

            <h2
              id="cta-heading"
              className="mt-6 font-medium text-background leading-[1.02]"
              style={{
                fontSize: "clamp(40px, 6.4vw, 96px)",
                letterSpacing: "-0.05em",
              }}
            >
              Want to be the{" "}
              <span
                className="italic"
                style={{
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                  fontWeight: 400,
                  color: "var(--color-accent-violet)",
                  /* Lock min-width to the longest rotating word so the
                     headline never reflows mid-rotation. "weirdest" is
                     the longest at 8 chars; we add a hair more for the
                     italic ascenders. */
                  display: "inline-block",
                  minWidth: "5.5ch",
                  textAlign: "left",
                }}
              >
                <RotatingWord
                  words={ROTATING_WORDS}
                  interval={2400}
                  duration={0.55}
                />
              </span>{" "}
              case study?
            </h2>

            <p className="mt-8 text-lg sm:text-xl lg:text-2xl text-background/80 max-w-2xl leading-relaxed">
              Fixed-cost sprints. Friday demos. Production code by week
              three. Send a one-paragraph problem statement and a plan
              comes back inside 48 hours.
            </p>

            <div className="mt-12 flex flex-wrap items-center gap-6">
              <MagneticPill
                href="/contact"
                variant="primary"
                strength={0.22}
                cursorText="Let's talk"
                ariaLabel="Start a project — open the contact page"
              >
                Start a project
              </MagneticPill>

              <a
                href="/process"
                className="inline-flex items-center gap-2 text-base sm:text-lg font-medium text-background/85 hover:text-background transition-colors focus-ring rounded-md px-2 py-1"
              >
                <span
                  className="font-mono text-[11px] uppercase tracking-[0.22em] text-background/60"
                  style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
                >
                  Or
                </span>
                see how we work
                <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
