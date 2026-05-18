"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

import { AnimateIn, NumberTicker } from "@/components/primitives";
import { useMounted } from "@/lib/useMounted";
import { PAGE_METRICS } from "@/app/work/data";

/**
 * WorkMetrics — the lavender-washed tally strip.
 *
 * Sits between the grid and the all-clients pill grid. Pure typography
 * on `--color-paper-alt` (lavender wash). Four big NumberTickers that
 * mirror the hero's tricolon claim — "Ten clients. Nine industries.
 * Three continents. Each one shipped."
 *
 * 2026 upgrade: a scroll-driven spotlight sweeps horizontally across
 * the section as the user scrolls through it. Implementation:
 *   • useScroll bound to the section element, offset start-end → end-start.
 *   • useTransform maps progress [0, 1] → sweep position [-20%, 120%].
 *   • A radial-gradient overlay reads that position via inline style.
 *   • A spring on the sweep so the light "follows" scroll with weight
 *     instead of snapping 1:1.
 *
 * No ScrollTrigger pin — that would hijack scroll on a relatively
 * short section and conflict with PageTransition's opacity-only rule.
 * The sweep happens naturally as the section enters and exits, so
 * users see the full arc without a forced pause.
 */
export default function WorkMetrics() {
  const sectionRef = useRef<HTMLElement>(null);
  const mounted = useMounted();

  /* Section-relative scroll progress. start-end → first pixel of
     section reaches bottom of viewport. end-start → last pixel of
     section leaves the top of viewport. The sweep traverses the full
     vertical journey of the section through the viewport. */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  /* Spring-smoothed progress — the light "follows" scroll with mass.
     Without the spring, fast scrolls cause the sweep to teleport;
     with it, the sweep eases into the new position over ~300ms. */
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 28,
    mass: 0.35,
  });

  /* Map progress to a horizontal translate. The sweep overlay is
     inset-x-[-40%] (wider than section by 80%), and we translate it
     from -20% (overlay shifted left of centre) to +20% (shifted
     right). The wider-than-parent overlay means the violet glow
     enters the visible area from off-screen on both ends. */
  const sweepX = useTransform(smoothProgress, [0, 1], ["-20%", "20%"]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="metrics-heading"
      className="relative overflow-hidden bg-paper-alt"
    >
      {/* ── Sweep overlay ──────────────────────────────────────────
          A soft radial gradient translates horizontally across the
          section as the user scrolls. Tuned narrower (28% width vs
          40% before) and lower-alpha (0.22 vs 0.32) so it reads as
          ambient lighting on the lavender wash — never as a blob
          competing with the type. */}
      {mounted ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -inset-x-[40%] z-[0]"
          style={{
            backgroundImage:
              "radial-gradient(28% 65% at 50% 50%, rgba(189, 112, 246, 0.22) 0%, rgba(189, 112, 246, 0.08) 40%, rgba(189, 112, 246, 0) 75%)",
            x: sweepX,
            willChange: "transform",
          }}
        />
      ) : null}

      {/* ── Hairline lattice ─────────────────────────────────────
          Subtle grid texture under the sweep. Opacity is intentionally
          near the visibility floor — the columns shouldn't read as
          UI, only as paper texture. Bumped down from 0.06 to 0.02
          after design review (lavender wash needs less, not more,
          structural noise). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[0] opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent 0, transparent calc(100% / 12 - 1px), rgba(3,2,11,1) calc(100% / 12 - 1px), rgba(3,2,11,1) calc(100% / 12))",
          backgroundSize: "calc(100% / 12) 100%",
        }}
      />

      <div className="relative z-[1] mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20 py-20 sm:py-24 lg:py-28">
        <div className="flex items-baseline justify-between gap-6 mb-6 sm:mb-8">
          <p
            id="metrics-heading"
            className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.22em] text-muted"
            style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
          >
            N° 06 — Numbers that moved
          </p>
          <p
            className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-muted tabular-nums hidden sm:block"
            style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
          >
            audited 2026.05
          </p>
        </div>

        {/* Section narrative — sets the frame BEFORE the numbers,
            so the reader knows these are real comparisons, not
            self-congratulation. */}
        <div className="mb-12 sm:mb-16 max-w-3xl">
          <p
            className="font-medium text-foreground leading-[1.08]"
            style={{
              fontSize: "clamp(28px, 3.6vw, 48px)",
              letterSpacing: "-0.035em",
            }}
          >
            Four numbers,{" "}
            <span
              className="italic text-primary"
              style={{
                fontFamily: "var(--font-instrument-serif), Georgia, serif",
                fontWeight: 400,
              }}
            >
              four real engagements.
            </span>
          </p>
          <p className="mt-4 text-base sm:text-lg text-foreground/75 leading-relaxed">
            No round-number brags. Each stat comes from a specific
            production system you can read about in the case studies
            above.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8 sm:gap-x-12 lg:gap-x-16">
          {PAGE_METRICS.map((metric, idx) => (
            <MetricCell
              key={metric.label}
              metric={metric}
              index={idx}
              sectionProgress={smoothProgress}
            />
          ))}
        </div>

        {/* Closing editorial line — italic Instrument Serif, anchored
            to the right edge so it reads as a margin note signing off
            on the row of numbers. */}
        <div className="mt-16 sm:mt-20 flex flex-col items-end gap-2 border-t border-foreground/15 pt-8">
          <p
            className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-muted"
            style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
          >
            Read more in the case studies
          </p>
          <p
            className="max-w-md text-right text-base sm:text-lg text-foreground/80 leading-snug"
          >
            Every number above is{" "}
            <span
              className="italic text-primary"
              style={{
                fontFamily: "var(--font-instrument-serif), Georgia, serif",
                fontWeight: 400,
              }}
            >
              traceable
            </span>{" "}
            to a production system you can audit.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── MetricCell ──────────────────────────────────────────────────
   One of the four big outcome metrics. Anatomy:
     • Mono source line (project + sector) — context, never decoration
     • Big NumberTicker (with optional prefix like "<")
     • Mono label
     • Delta caption — italic Instrument Serif accent line that grounds
       the number in a real comparison (e.g. "up from 70% industry avg")

   The cell's accent halo activates when the section's smooth scroll
   progress is in this cell's "lane": cell 0 lights up for progress
   0.25–0.45, cell 1 for 0.37–0.57, etc. Overlapping windows give a
   continuous wash. */
function MetricCell({
  metric,
  index,
  sectionProgress,
}: {
  metric: (typeof PAGE_METRICS)[number];
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sectionProgress: any;
}) {
  const baseStart = 0.25 + index * 0.12;
  const haloOpacity = useTransform(
    sectionProgress,
    [baseStart - 0.05, baseStart, baseStart + 0.05, baseStart + 0.15, baseStart + 0.2],
    [0, 0.4, 1, 0.5, 0],
  );
  const numberScale = useTransform(
    sectionProgress,
    [baseStart - 0.05, baseStart + 0.1, baseStart + 0.2],
    [1, 1.04, 1],
  );

  return (
    <AnimateIn
      delay={index * 0.1}
      y={16}
      duration={0.6}
      className="relative border-l border-foreground/15 pl-6 sm:pl-8 first:border-l-0 lg:border-l"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-2 rounded-2xl"
        style={{
          background:
            "radial-gradient(55% 70% at 30% 40%, rgba(189, 112, 246, 0.16) 0%, transparent 70%)",
          opacity: haloOpacity,
          willChange: "opacity",
        }}
      />
      <div className="relative flex flex-col">
        {/* Source line — tells the reader where this number actually
            comes from. Editorial signal: we don't make up stats. */}
        <p
          className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-muted"
          style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
        >
          {metric.source}
        </p>

        {/* The number itself. The optional prefix (e.g. "<" for
            "<12s") renders at 0.55em — smaller and weight-200 so it
            reads as a comparative qualifier, not a typographic equal
            to the number. The italic Instrument Serif treatment makes
            it feel hand-written, like a margin note. */}
        <motion.p
          className="mt-3 flex items-baseline font-medium leading-[0.88] tracking-[-0.055em] text-foreground tabular-nums"
          style={{
            fontSize: "clamp(48px, 7.4vw, 112px)",
            scale: numberScale,
            transformOrigin: "left center",
            willChange: "transform",
          }}
        >
          {metric.prefix ? (
            <span
              aria-hidden
              className="text-foreground/55 italic"
              style={{
                fontFamily: "var(--font-instrument-serif), Georgia, serif",
                fontSize: "0.55em",
                fontWeight: 400,
                marginRight: "0.06em",
                transform: "translateY(-0.08em)",
              }}
            >
              {metric.prefix}
            </span>
          ) : null}
          <NumberTicker
            value={metric.value}
            suffix={metric.suffix}
            duration={2}
          />
        </motion.p>

        {/* Label */}
        <p
          className="mt-4 font-mono text-[11px] sm:text-xs uppercase tracking-[0.22em] text-foreground-mid"
          style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
        >
          {metric.label}
        </p>

        {/* Delta caption — italic serif accent line. Picks up the
            tabular-nums setting only when the delta string contains
            digits (otherwise straight italic). Grounds the number in
            a comparison so the reader sees movement, not a static brag. */}
        {metric.delta ? (
          <p
            className="mt-3 text-sm sm:text-base text-foreground/75 leading-tight tabular-nums"
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            {metric.delta}
          </p>
        ) : null}
      </div>
    </AnimateIn>
  );
}
