"use client";

import { Fragment, useMemo, useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionTemplate,
  type MotionValue,
} from "framer-motion";

import { TESTIMONIALS } from "@/app/work/data";

/**
 * WorkTestimonials — "N° 07 — Voices", as a GALLERY OF VOICES.
 *
 * The structural idea: three people speak from three DIRECTIONS, like
 * conversations you walk past. Each voice enters from its own edge —
 * MedCollect from the left, Skyline from the right, Aliste rising from
 * below — with its accent light washing in from that same edge. The
 * quote then SPEAKS itself: ghost text inks in word-by-word with real
 * speech rhythm (longer beats after commas and periods), the
 * load-bearing phrase ignites in the client's colour and swells as
 * it's said, and the attribution lands only once the voice finishes.
 *
 * Garnishes stolen deliberately from the prototype round:
 *   • the spoken word-ink sweep (A) — the voice itself;
 *   • the whisper tracking-settle (C) — each quote starts a touch
 *     wide-tracked and settles to display tracking as it speaks;
 *   • the giant quote-mark bloom (B) — arriving from the voice's edge.
 *
 * All choreography is scroll-position-bound per spread (useScroll +
 * spring → pure functions of progress; reduced-motion parity is
 * automatic). Transform/opacity/colour only — no blur, no canvas —
 * 60fps and Firefox-identical. Words are real DOM text (screen readers
 * read the quote naturally); decorations are aria-hidden.
 */

type Dir = "left" | "right" | "bottom";
const DIRS: readonly Dir[] = ["left", "right", "bottom"] as const;

const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/* Speech-weighted word list: words ending in , or . carry a longer
   pre-pause for the NEXT word (the voice breathes); key-phrase words
   are flagged for ignition. Pure function of the quote string. */
interface SpokenWordSpec {
  readonly text: string;
  readonly inKey: boolean;
  readonly start: number; // cumulative speech-units before this word
}
function buildSpeech(quote: string, keyPhrase: string): { words: SpokenWordSpec[]; total: number } {
  const ki = quote.indexOf(keyPhrase);
  const ke = ki + keyPhrase.length;
  let pos = 0;
  let acc = 0;
  const words: SpokenWordSpec[] = [];
  for (const text of quote.split(" ")) {
    const s = quote.indexOf(text, pos);
    pos = s + text.length;
    words.push({ text, inKey: s >= ki && s < ke, start: acc });
    acc += /[.,]$/.test(text) ? 2.2 : 1;
  }
  return { words, total: acc };
}

const hexToRgb = (h: string): [number, number, number] => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

export default function WorkTestimonials() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="relative overflow-hidden bg-background border-t border-border"
    >
      {/* Film grain — site-standard surface. */}
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

      {/* Header chrome (contained). */}
      <div className="relative z-[1] mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20 pt-20 sm:pt-24 lg:pt-28">
        <div className="flex items-baseline justify-between gap-6">
          <p
            id="testimonials-heading"
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted sm:text-xs"
            style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
          >
            N° 07 — Voices
          </p>
          <p
            className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-muted tabular-nums sm:block sm:text-[11px]"
            style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
          >
            03 quotes · 03 engagements
          </p>
        </div>
        <h2
          className="mt-6 max-w-4xl font-medium leading-[1.02] text-foreground"
          style={{ fontSize: "clamp(38px, 5.4vw, 76px)", letterSpacing: "-0.05em" }}
        >
          What the teams{" "}
          <span
            className="italic text-primary"
            style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif", fontWeight: 400 }}
          >
            actually said.
          </span>
        </h2>
      </div>

      {/* The gallery — full-bleed passages, one voice per direction. */}
      <div className="relative z-[1]">
        {TESTIMONIALS.map((t, i) => (
          <VoicePassage key={t.project} t={t} dir={DIRS[i % DIRS.length]!} />
        ))}
      </div>

      {/* Honesty footnote. */}
      <p
        className="relative z-[1] mx-auto w-full max-w-[1440px] px-6 pb-20 font-mono text-[11px] uppercase tracking-[0.18em] text-muted sm:px-8 sm:pb-24 sm:text-xs lg:px-14 xl:px-20"
        style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
      >
        Names abridged for client confidentiality · originals available on request
      </p>
    </section>
  );
}

/* ─── VoicePassage ────────────────────────────────────────────────
   One voice. Full-bleed wrapper (its accent light reaches the true
   viewport edge) around a contained quote block aligned toward the
   voice's direction. */
function VoicePassage({ t, dir }: { t: (typeof TESTIMONIALS)[number]; dir: Dir }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "start 0.28"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.4 });

  const { words, total } = useMemo(() => buildSpeech(t.quote, t.keyPhrase), [t]);
  const accentRgb = useMemo(() => hexToRgb(t.accentColor), [t.accentColor]);

  /* Entry — the voice arrives from its edge. */
  const arrive = useTransform(p, (v) => easeOut(clamp01(v / 0.45)));
  const ex = useTransform(arrive, (v) => (dir === "left" ? (1 - v) * -56 : dir === "right" ? (1 - v) * 56 : 0));
  const ey = useTransform(arrive, (v) => (dir === "bottom" ? (1 - v) * 48 : 0));

  /* Whisper → settle: tracking eases from wide to display as it speaks. */
  const lsEm = useTransform(p, (v) => 0.045 - easeOut(clamp01(v / 0.65)) * 0.06);
  const letterSpacing = useMotionTemplate`${lsEm}em`;

  /* Accent light from the voice's edge — swells while speaking, then
     settles warm. Baked gradient, opacity-only (Firefox-safe). */
  const washOpacity = useTransform(p, [0, 0.12, 0.62, 1], [0, 0.1, 0.55, 0.34], { clamp: true });
  const washBg =
    dir === "left"
      ? `radial-gradient(58% 130% at 0% 46%, ${t.accentColor}2e 0%, ${t.accentColor}14 38%, transparent 72%)`
      : dir === "right"
        ? `radial-gradient(58% 130% at 100% 46%, ${t.accentColor}2e 0%, ${t.accentColor}14 38%, transparent 72%)`
        : `radial-gradient(120% 70% at 50% 100%, ${t.accentColor}2e 0%, ${t.accentColor}12 40%, transparent 74%)`;

  /* Giant quote-mark blooms in from the same edge. */
  const markOpacity = useTransform(p, [0.08, 0.5], [0, 0.13], { clamp: true });
  const markShift = useTransform(p, (v) => (1 - easeOut(clamp01((v - 0.08) / 0.42))) * (dir === "right" ? 40 : -40));

  /* Attribution lands once the voice finishes. */
  const attrOpacity = useTransform(p, [0.8, 0.96], [0, 1], { clamp: true });
  const attrY = useTransform(p, (v) => (1 - easeOut(clamp01((v - 0.8) / 0.16))) * 12);

  const align =
    dir === "left" ? "items-start text-left" : dir === "right" ? "items-end text-right" : "items-center text-center";

  return (
    <div ref={ref} className="relative w-full">
      {/* Edge light — full-bleed, reaches the real viewport edge. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: washBg, opacity: washOpacity }}
      />

      <div className="relative mx-auto flex min-h-[72vh] w-full max-w-[1440px] flex-col justify-center px-6 py-16 sm:px-8 sm:py-20 lg:px-14 xl:px-20">
        {/* Quote-mark bloom — from the voice's edge. */}
        <motion.span
          aria-hidden
          className={`pointer-events-none absolute top-6 select-none leading-[0.6] ${
            dir === "right" ? "right-4 sm:right-8" : "left-4 sm:left-8"
          }`}
          style={{
            fontFamily: "var(--font-instrument-serif), Georgia, serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(140px, 18vw, 280px)",
            color: t.accentColor,
            opacity: markOpacity,
            x: markShift,
          }}
        >
          &ldquo;
        </motion.span>

        <motion.div className={`flex flex-col gap-8 ${align}`} style={{ x: ex, y: ey }}>
          <blockquote className="max-w-[1180px]">
            <motion.p
              className="italic leading-[1.16]"
              style={{
                fontFamily: "var(--font-instrument-serif), Georgia, serif",
                fontWeight: 400,
                fontSize: "clamp(30px, 4.4vw, 64px)",
                letterSpacing,
              }}
            >
              {words.map((w, i) => (
                <Fragment key={i}>
                  <SpokenWord spec={w} total={total} p={p} accentRgb={accentRgb}>
                    {w.text}
                  </SpokenWord>
                  {/* the inter-word space lives OUTSIDE the inline-block
                      span — trailing spaces inside one get trimmed at
                      layout, which glued the words together */}
                  {i < words.length - 1 ? " " : null}
                </Fragment>
              ))}
            </motion.p>
          </blockquote>

          {/* Attribution — lands when the voice finishes. */}
          <motion.div
            className={`flex flex-col gap-1.5 ${dir === "right" ? "items-end" : dir === "bottom" ? "items-center" : "items-start"}`}
            style={{ opacity: attrOpacity, y: attrY }}
          >
            <p className="text-sm font-medium tracking-[-0.01em] text-foreground sm:text-base">
              {t.author}
              <span className="font-normal text-muted"> · {t.role}</span>
            </p>
            <p
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:text-[11px]"
              style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: t.accentColor, boxShadow: `0 0 6px ${t.accentColor}` }}
              />
              {t.project}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── SpokenWord ──────────────────────────────────────────────────
   One word of the voice. Inks from ghost to full as the speech sweep
   passes its slot; key-phrase words interpolate to the client accent
   and swell slightly as they're said. Trailing space stays inside the
   span so line-wrapping behaves like normal prose. */
function SpokenWord({
  spec,
  total,
  p,
  accentRgb,
  children,
}: {
  spec: SpokenWordSpec;
  total: number;
  p: MotionValue<number>;
  accentRgb: [number, number, number];
  children: React.ReactNode;
}) {
  /* The sweep covers all speech-units across p∈[0.1, 0.82] — the voice
     finishes before the attribution lands. Each word inks over ~2.6
     units, so neighbours overlap like syllables, not a hard cursor. */
  const k = useTransform(p, (v) => {
    const f = ((v - 0.1) / 0.72) * total;
    return clamp01((f - spec.start) / 2.6);
  });
  const color = useTransform(k, (v) => {
    const e = easeOut(v);
    if (spec.inKey) {
      const r = Math.round(3 + (accentRgb[0] - 3) * e);
      const g = Math.round(2 + (accentRgb[1] - 2) * e);
      const b = Math.round(11 + (accentRgb[2] - 11) * e);
      return `rgba(${r}, ${g}, ${b}, ${(0.14 + e * 0.86).toFixed(3)})`;
    }
    return `rgba(3, 2, 11, ${(0.14 + e * 0.86).toFixed(3)})`;
  });
  /* Swell only on key words — transform doesn't reflow neighbours. */
  const scale = useTransform(k, (v) => (spec.inKey ? 1 + easeOut(v) * 0.045 : 1));

  return (
    <motion.span className="inline-block" style={{ color, scale, transformOrigin: "50% 80%" }}>
      {children}
    </motion.span>
  );
}
