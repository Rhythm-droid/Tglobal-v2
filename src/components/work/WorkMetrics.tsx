"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionTemplate,
  type MotionValue,
} from "framer-motion";

import { AnimateIn } from "@/components/primitives";
import { PAGE_METRICS } from "@/app/work/data";

/**
 * WorkMetrics — "N° 06 — Numbers that moved", as HOLLOW → LIGHT.
 *
 * Every numeral starts as a hollow outline — where the number started —
 * and as the row crosses the reader's eyeline, living aurora light
 * floods the glyphs digit by digit, each digit gliding in from depth
 * with a small weighted settle as it ignites. Hollow is the before;
 * lit is where we left it. A new transformation in the site's
 * type-as-material family (pixelate → particles → scramble → flight →
 * light), and the mesh-gradient identity distilled into typography.
 *
 * Mechanics:
 *   • Each digit is a cell with three stacked copies of the same glyph:
 *     ghost (transparent fill, violet text-stroke — defines layout),
 *     halo (violet, small static blur, opacity scrubbed) and lit
 *     (background-clip:text over a panning gradient — the
 *     `metric-light-flow` keyframe — revealed by a scrubbed clip wipe).
 *     Same glyph + same font in all three → pixel-identical stacking.
 *   • Choreography is scroll-position-bound (per-row useScroll +
 *     spring): digit i arrives (rise + back-out settle + focus-pull
 *     from 6px blur) on its own window, then ignites slightly after —
 *     light chases the digits across the number. Deterministic →
 *     reduced-motion parity automatic.
 *   • All animated styles are always-MotionValues (never a
 *     number↔MotionValue swap), templates are pure functions of scroll
 *     (no trig, no randomness) → no hydration drift. No canvas, no
 *     large blur (Firefox-safe), transform/opacity/clip only → 60fps.
 */

/* Per-digit choreography windows (fractions of the row's scrub). */
const ARRIVE_SPAN = 0.3; // each digit's arrival duration
const ARRIVE_STEP = 0.09; // stagger between digits
const IGNITE_LAG = 0.16; // light chases the arrival by this much
const IGNITE_SPAN = 0.24;

/* Weighted settle (back-out) + cubic ease, applied inside transforms. */
const backOut = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

const LIGHT_GRADIENT =
  "linear-gradient(100deg, #bd70f6 0%, #4b28ff 30%, #8c68fa 55%, #c5baff 75%, #bd70f6 100%)";

export default function WorkMetrics() {
  return (
    <section
      aria-labelledby="metrics-heading"
      className="relative overflow-hidden bg-paper-alt"
    >
      {/* Ambient lavender washes — light, no structure. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: [
            "radial-gradient(55% 40% at 82% 6%, rgba(197, 186, 255, 0.34) 0%, rgba(197, 186, 255, 0) 70%)",
            "radial-gradient(60% 45% at 10% 58%, rgba(237, 228, 255, 0.6) 0%, rgba(237, 228, 255, 0) 70%)",
            "radial-gradient(50% 40% at 90% 92%, rgba(220, 209, 255, 0.4) 0%, rgba(220, 209, 255, 0) 70%)",
          ].join(", "),
        }}
      />
      {/* Film grain. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: "240px 240px",
          opacity: 0.05,
          mixBlendMode: "overlay",
        }}
      />

      <div className="relative z-[1] mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20 py-20 sm:py-24 lg:py-28">
        <div className="mb-6 flex items-baseline justify-between gap-6 sm:mb-8">
          <p
            id="metrics-heading"
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted sm:text-xs"
            style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
          >
            N° 06 — Numbers that moved
          </p>
          <p
            className="rounded-full border border-foreground/25 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/70 tabular-nums sm:text-[11px]"
            style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
          >
            Audited 2026.05
          </p>
        </div>

        <div className="mb-8 max-w-3xl sm:mb-10">
          <p
            className="font-medium leading-[1.08] text-foreground"
            style={{ fontSize: "clamp(28px, 3.6vw, 48px)", letterSpacing: "-0.035em" }}
          >
            Four numbers,{" "}
            <span
              className="italic text-primary"
              style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif", fontWeight: 400 }}
            >
              four real engagements.
            </span>
          </p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/75 sm:text-lg">
            No round-number brags — each one starts hollow and fills with
            light, from where it began to where we left it. Every stat
            traces to a production system in the case studies above.
          </p>
        </div>

        {/* ── The stats ────────────────────────────────────────────── */}
        <div className="border-t border-foreground/15">
          {PAGE_METRICS.map((metric, idx) => (
            <LightMetricRow key={metric.label} metric={metric} index={idx} />
          ))}
        </div>

        <div className="mt-12 flex flex-col items-end gap-2 sm:mt-16">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted sm:text-[11px]"
            style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
          >
            Read more in the case studies
          </p>
          <p className="max-w-md text-right text-base leading-snug text-foreground/80 sm:text-lg">
            Every number above is{" "}
            <span
              className="italic text-primary"
              style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif", fontWeight: 400 }}
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

/* ─── LightMetricRow ──────────────────────────────────────────────
   One stat: chrome on the left, the igniting numeral on the right.
   The value splits into digit cells — numeric glyphs at full size plus
   the suffix as a final smaller cell — each arriving and igniting on
   its own staggered window of the row's scrub. */
function LightMetricRow({
  metric,
  index,
}: {
  metric: (typeof PAGE_METRICS)[number];
  index: number;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  /* Choreography runs while the row climbs from low viewport to just
     above centre — it ignites exactly where the reader is looking. */
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start 0.94", "start 0.38"],
  });
  const t = useSpring(scrollYProgress, { stiffness: 110, damping: 30, mass: 0.4 });

  /* "from X → Y" journey tag fades up once the light has mostly landed. */
  const tagOpacity = useTransform(t, [0.6, 0.9], [0, 1], { clamp: true });
  const tagY = useTransform(t, (v) => (1 - easeOut(Math.min(1, Math.max(0, (v - 0.6) / 0.3)))) * 10);

  /* Split "<12" → ["<","1","2"], suffix rides as the last, smaller cell. */
  const numChars = [...(metric.prefix ?? "")] .concat([...String(metric.value)]);
  const cells = numChars
    .map((ch) => ({ ch, small: false }))
    .concat(metric.suffix ? [{ ch: metric.suffix, small: true }] : []);

  return (
    <div
      ref={rowRef}
      className="grid grid-cols-1 items-center gap-y-3 border-b border-foreground/15 py-9 sm:py-12 lg:grid-cols-12 lg:gap-x-10"
    >
      {/* Chrome — source (client-accent dot), label, delta. */}
      <AnimateIn delay={0.05} y={12} duration={0.6} className="lg:col-span-4">
        <p
          className="inline-flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:text-[11px]"
          style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
        >
          <span aria-hidden className="text-foreground/40">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: metric.accent, boxShadow: `0 0 6px ${metric.accent}` }}
          />
          {metric.source}
        </p>
        <p
          className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground-mid sm:text-xs"
          style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
        >
          {metric.label}
        </p>
        {metric.delta ? (
          <p
            className="mt-3 text-sm leading-tight text-foreground/75 tabular-nums sm:text-base"
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            {metric.delta}
          </p>
        ) : null}
      </AnimateIn>

      {/* The numeral — hollow, then flooded with light digit by digit. */}
      <div className="lg:col-span-8 lg:justify-self-end lg:text-right">
        <p
          aria-hidden
          className="whitespace-nowrap font-semibold leading-[0.9]"
          style={{ fontSize: "clamp(88px, 13vw, 210px)", letterSpacing: "-0.05em" }}
        >
          {cells.map((cell, i) => (
            <DigitCell key={i} ch={cell.ch} small={cell.small} t={t} index={i} />
          ))}
        </p>
        <motion.p
          aria-hidden
          className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/45 sm:text-xs"
          style={{
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            opacity: tagOpacity,
            y: tagY,
          }}
        >
          from <span className="font-semibold text-foreground/80">{metric.fromTick}</span>{" "}
          <span aria-hidden>→</span>{" "}
          <span className="font-semibold text-primary">{metric.toTick}</span>
        </motion.p>
        <span className="sr-only">
          {metric.label}: {metric.toTick}, {metric.delta ?? `from ${metric.fromTick}`}
        </span>
      </div>
    </div>
  );
}

/* ─── DigitCell ───────────────────────────────────────────────────
   One glyph, three stacked copies (ghost / halo / lit), arriving with
   a weighted settle then igniting as the light reaches it. */
function DigitCell({
  ch,
  small,
  t,
  index,
}: {
  ch: string;
  small: boolean;
  t: MotionValue<number>;
  index: number;
}) {
  const a = 0.04 + index * ARRIVE_STEP;
  const b = a + ARRIVE_SPAN;
  const c = a + IGNITE_LAG;
  const d = c + IGNITE_SPAN;

  /* Arrival — rise from below with back-out settle + focus pull. */
  const k = useTransform(t, [a, b], [0, 1], { clamp: true });
  const opacity = useTransform(k, (v) => easeOut(v));
  const yPct = useTransform(k, (v) => (1 - backOut(v)) * 24);
  const scale = useTransform(k, (v) => 0.72 + backOut(v) * 0.28);
  const transform = useMotionTemplate`translateY(${yPct}%) scale(${scale})`;
  const blurPx = useTransform(k, (v) => (1 - easeOut(v)) * 6);
  const filter = useMotionTemplate`blur(${blurPx}px)`;

  /* Ignition — the lit copy wipes open; the halo blooms with it. */
  const k2 = useTransform(t, [c, d], [0, 1], { clamp: true });
  const litPct = useTransform(k2, (v) => (1 - easeOut(v)) * 100);
  const litClip = useMotionTemplate`inset(-0.15em ${litPct}% -0.15em -0.05em)`;
  const haloOpacity = useTransform(k2, (v) => easeOut(v) * 0.45);

  return (
    <motion.span
      className="relative inline-block will-change-transform"
      style={{
        fontSize: small ? "0.55em" : undefined,
        opacity,
        transform,
        filter,
        transformOrigin: "50% 80%",
      }}
    >
      {/* ghost — hollow outline (in flow, defines the cell's box) */}
      <span
        style={{
          color: "transparent",
          WebkitTextStroke: "1.5px rgba(75, 40, 255, 0.32)",
        }}
      >
        {ch}
      </span>
      {/* halo — soft violet bloom behind the lit glyph */}
      <motion.span
        aria-hidden
        className="absolute inset-0"
        style={{ color: "#7b47f6", filter: "blur(10px)", opacity: haloOpacity }}
      >
        {ch}
      </motion.span>
      {/* lit — living gradient light, revealed by the scrubbed wipe */}
      <motion.span
        aria-hidden
        className="metric-light absolute inset-0"
        style={{
          background: LIGHT_GRADIENT,
          backgroundSize: "300% 100%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          clipPath: litClip,
          animationDelay: `-${(index * 0.6).toFixed(1)}s`,
        }}
      >
        {ch}
      </motion.span>
    </motion.span>
  );
}
