"use client";

import { Fragment, useEffect, useRef } from "react";

import { useMounted } from "@/lib/useMounted";

/* ProcessHero — "THE QUARTER COLLAPSE → THE SENTENCE THAT SHIPS".
   ─────────────────────────────────────────────────────────────
   Two spectacles, one argument, NOTHING else on stage:

     1. LANDING — a wall of 91 ghost day-cells ("ONE QUARTER · how
        agencies see your project · 90 days") opens faded + soft-
        blurred; the first scroll pulls it into focus.
     2. THE SHOCKWAVE — scroll detonates the quarter: a heartbeat of
        inward anticipation, then the blast ripples outward from the
        centre; nearest days blow first, tumbling along their true
        outward vectors. The label zooms past the camera.
     3. THE SENTENCE SHIPS — in the cleared air the headline goes
        through the SDLC, centre stage and alone:
          · SPEC — dashed draft frames with mono spec annotations
            ("h1 · fixed cost · deadline") around hollow outline words,
            the pipeline chip reading SPEC;
          · BUILD — a glowing cursor sweeps the sentence into solid
            ink word by word, pipeline ticks to BUILD;
          · SHIP — "two weeks." lands in serif violet, the pipeline
            ticks to SHIP, and ● LIVE IN PRODUCTION · v1.0.0 · FRI W2
            stamps beneath with a ripple, next to the crush receipt
            (~~90 DAYS~~ → 14).
        Typography is the product. No diagram survives the blast.

   Light lavender stage; bloom + drifting remnant motes are the only
   atmosphere. All choreography is a pure function of scroll position
   (one rAF loop writing to refs — deterministic, parity-safe);
   transform/opacity + baked gradients only (the focus-pull's 8px blur
   is the single, small, Firefox-safe exception). Positioned chrome
   uses INLINE coordinates (Tailwind's left-1/2 / bottom-[N] silently
   failed in this file before). SSR-safe: seeded + rounded layout at
   module load; trig only ever runs inside the client loop. */

const COLS = 13;
const ROWS = 7;
const N = COLS * ROWS;

/* Blast epicentre (fractions of stage size). */
const CX = 0.5;
const CY = 0.47;

const DEAD_NOTES = [
  "meeting",
  "deck v4",
  "sync",
  "review",
  "waiting",
  "alignment",
  "steering",
] as const;

/* The sentence — each word carries an optional mono spec annotation
   shown during its draft phase (the "design-tool" garnish). */
const HEADLINE_WORDS = [
  { text: "We", accent: false, spec: "h1" },
  { text: "crush", accent: false, spec: "fixed cost" },
  { text: "it", accent: false, spec: null },
  { text: "to", accent: false, spec: null },
  { text: "two weeks.", accent: true, spec: "deadline" },
] as const;

const PIPELINE = [
  { label: "SPEC", at: 0.5 },
  { label: "BUILD", at: 0.62 },
  { label: "SHIP", at: 0.88 },
] as const;

interface CellSpec {
  readonly idx: number;
  readonly leftPct: string;
  readonly topPct: string;
  readonly bx: number;
  readonly by: number;
  readonly delay: number;
  readonly rot: number;
  readonly jitterPhase: number;
  readonly note: string;
}

const CELLS: readonly CellSpec[] = (() => {
  let seed = 1311;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const out: CellSpec[] = [];
  for (let i = 0; i < N; i++) {
    const col = i % COLS;
    const row = (i / COLS) | 0;
    const fx = 12 + (col / (COLS - 1)) * 76;
    const fy = 16 + (row / (ROWS - 1)) * 58;
    const cx = fx - CX * 100;
    const cy = (fy - CY * 100) * 1.4;
    const len = Math.max(6, Math.hypot(cx, cy));
    const dist01 = Math.min(1, len / 52);
    out.push({
      idx: i,
      leftPct: fx.toFixed(2),
      topPct: fy.toFixed(2),
      bx: Number((cx / len + (rnd() * 2 - 1) * 0.35).toFixed(3)),
      by: Number((cy / len / 1.4 + (rnd() * 2 - 1) * 0.35).toFixed(3)),
      delay: Number((dist01 * 0.16 + rnd() * 0.04).toFixed(3)),
      rot: Number(((rnd() * 2 - 1) * 160).toFixed(1)),
      jitterPhase: Number((rnd() * 6.28).toFixed(2)),
      note: DEAD_NOTES[i % DEAD_NOTES.length]!,
    });
  }
  return out;
})();

/* Remnant dust — drifting after the blast. */
const MOTES: readonly { left: string; top: string; size: number; opacity: number; delay: string }[] =
  (() => {
    let seed = 4242;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    return Array.from({ length: 18 }, () => ({
      left: `${(rnd() * 92 + 4).toFixed(2)}%`,
      top: `${(rnd() * 70 + 8).toFixed(2)}%`,
      size: Number((2.5 + rnd() * 2.5).toFixed(2)),
      opacity: Number((0.05 + rnd() * 0.06).toFixed(3)),
      delay: `-${(rnd() * 7).toFixed(2)}s`,
    }));
  })();

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeIn = (x: number) => x * x * x;

export default function ProcessHero() {
  const mounted = useMounted();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cellDoneRef = useRef<boolean[]>([]);
  const labelRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const motesRef = useRef<HTMLDivElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const pipelineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const wordBuiltRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const wordFrameRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const headWrapRef = useRef<HTMLDivElement>(null);
  const sentenceRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const liveRowRef = useRef<HTMLDivElement>(null);
  const pillRingRef = useRef<HTMLDivElement>(null);
  const curRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mounted) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const tick = () => {
      const r = section.getBoundingClientRect();
      const target = clamp01(-r.top / (r.height - window.innerHeight));
      curRef.current = lerp(curRef.current, target, 0.1);
      const T = curRef.current;
      const sw = stage.clientWidth;

      /* ── ACT 1 · focus-pull landing. */
      const wall = wallRef.current;
      if (wall) {
        if (T < 0.115) {
          const fk = easeOut(clamp01(T / 0.1));
          wall.style.filter = `blur(${((1 - fk) * 8).toFixed(2)}px)`;
          wall.style.opacity = (0.35 + fk * 0.65).toFixed(3);
        } else if (wall.style.filter !== "") {
          wall.style.filter = "";
          wall.style.opacity = "1";
        }
      }
      const cue = cueRef.current;
      if (cue) cue.style.opacity = String(clamp01(1 - T / 0.05));

      /* ── ACT 2 · THE SHOCKWAVE. */
      CELLS.forEach((spec, i) => {
        const el = cellRefs.current[i];
        if (!el) return;
        const pre = clamp01((T - 0.14 - spec.delay) / 0.05);
        const k = easeIn(clamp01((T - 0.19 - spec.delay) / 0.3));
        if (cellDoneRef.current[i] && k >= 1) return;
        const tremble = clamp01((T - 0.1) / 0.06) * (1 - k);
        const jx = Math.sin(T * 110 + spec.jitterPhase) * 2 * tremble;
        const jy = Math.cos(T * 96 + spec.jitterPhase) * 2 * tremble;
        const inward = Math.sin(Math.min(1, pre) * Math.PI) * -14;
        const mag = inward + k * sw * 1.1;
        el.style.transform = `translate(-50%, -50%) translate(${(spec.bx * mag + jx).toFixed(1)}px, ${(spec.by * mag + jy).toFixed(1)}px) rotate(${(spec.rot * k).toFixed(1)}deg) scale(${(1 - k * 0.45).toFixed(3)})`;
        el.style.opacity = String(clamp01(1 - k * 1.45));
        cellDoneRef.current[i] = k >= 1;
      });
      const label = labelRef.current;
      if (label) {
        label.style.opacity = String(clamp01(1 - (T - 0.16) / 0.09));
        label.style.transform = `translate(-50%, -50%) scale(${(1 + T * 0.55).toFixed(3)})`;
      }

      /* ── ACT 3 · THE SENTENCE SHIPS — alone, centre stage. */
      const headWrap = headWrapRef.current;
      if (headWrap) headWrap.style.opacity = String(easeOut(clamp01((T - 0.48) / 0.1)));

      PIPELINE.forEach((p, i) => {
        const el = pipelineRefs.current[i];
        if (el) el.style.opacity = T >= p.at ? "1" : "0.35";
        const dot = el?.querySelector("i");
        if (dot instanceof HTMLElement) {
          dot.style.background = T >= p.at ? "#4b28ff" : "rgba(3, 2, 11, 0.18)";
          dot.style.boxShadow = T >= p.at ? "0 0 8px rgba(75, 40, 255, 0.6)" : "none";
        }
      });

      const nw = HEADLINE_WORDS.length;
      const BUILD_START = 0.62;
      const BUILD_SPAN = 0.24;
      HEADLINE_WORDS.forEach((_, i) => {
        const a = BUILD_START + (i / nw) * BUILD_SPAN;
        const b = a + BUILD_SPAN / nw;
        const k = clamp01((T - a) / (b - a));
        const built = wordBuiltRefs.current[i];
        const frame = wordFrameRefs.current[i];
        if (built) built.style.clipPath = `inset(-0.2em ${((1 - k) * 100).toFixed(2)}% -0.2em 0)`;
        if (frame) frame.style.opacity = String(clamp01(easeOut(clamp01((T - 0.5) / 0.1)) - clamp01((T - a) / 0.1)));
      });
      const cursor = cursorRef.current;
      const sentence = sentenceRef.current;
      if (cursor && sentence) {
        const f = clamp01((T - BUILD_START) / BUILD_SPAN) * nw;
        const idx = Math.min(nw - 1, Math.floor(f));
        const built = wordBuiltRefs.current[idx];
        if (built) {
          const wr = built.getBoundingClientRect();
          const sr = sentence.getBoundingClientRect();
          cursor.style.left = `${(wr.left - sr.left + wr.width * (f - idx)).toFixed(1)}px`;
          cursor.style.top = `${(wr.top - sr.top - 4).toFixed(1)}px`;
          cursor.style.height = `${(wr.height + 8).toFixed(1)}px`;
          cursor.style.opacity = String(T > BUILD_START && T < BUILD_START + BUILD_SPAN + 0.02 ? 1 : 0);
        }
      }
      const sub = subRef.current;
      if (sub) {
        const sk = easeOut(clamp01((T - 0.84) / 0.1));
        sub.style.opacity = String(sk);
        sub.style.transform = `translateY(${((1 - sk) * 14).toFixed(1)}px)`;
      }
      const liveRow = liveRowRef.current;
      if (liveRow) {
        const pk = clamp01((T - 0.9) / 0.08);
        const overshoot = pk < 1 ? 1 + Math.sin(pk * Math.PI) * 0.12 : 1;
        liveRow.style.opacity = String(easeOut(pk));
        liveRow.style.transform = `translateX(-50%) scale(${(easeOut(pk) * overshoot).toFixed(3)})`;
      }
      const pillRing = pillRingRef.current;
      if (pillRing) {
        const k = clamp01((T - 0.92) / 0.08);
        pillRing.style.opacity = String(k > 0 ? (1 - easeOut(k)) * 0.5 : 0);
        pillRing.style.transform = `translate(-50%, -50%) scale(${(0.4 + easeOut(k) * 2.6).toFixed(3)})`;
      }

      /* atmosphere wakes as the dust clears */
      const motes = motesRef.current;
      if (motes) motes.style.opacity = String(easeOut(clamp01((T - 0.55) / 0.2)));
      const bloom = bloomRef.current;
      if (bloom) bloom.style.opacity = String(easeOut(clamp01((T - 0.5) / 0.2)));

      rafRef.current = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && rafRef.current == null) {
          rafRef.current = requestAnimationFrame(tick);
        } else if (!entry.isIntersecting && rafRef.current != null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(section);

    return () => {
      io.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [mounted]);

  return (
    <section
      ref={sectionRef}
      id="process-hero"
      aria-labelledby="process-hero-heading"
      className="relative w-full"
      style={{ height: "320svh" }}
    >
      <div
        ref={stageRef}
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
        style={{
          background: "linear-gradient(168deg, #faf7ff 0%, #efe7fb 55%, #e3d6fa 100%)",
        }}
      >
        {/* Film grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[7]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
            backgroundSize: "240px 240px",
            opacity: 0.05,
            mixBlendMode: "overlay",
          }}
        />

        {/* ── The quarter wall — soft until the first scroll. */}
        <div
          ref={wallRef}
          aria-hidden
          className="absolute inset-0 z-[1]"
          style={{ opacity: 0.35, filter: "blur(8px)", willChange: "filter, opacity" }}
        >
          {CELLS.map((spec, i) => (
            <div
              key={spec.idx}
              ref={(el) => {
                cellRefs.current[i] = el;
              }}
              className="absolute flex flex-col justify-between rounded-[10px] border p-[6px_8px]"
              style={{
                left: `${spec.leftPct}%`,
                top: `${spec.topPct}%`,
                width: "clamp(44px, 6.4vw, 92px)",
                height: "clamp(34px, 4.8vw, 68px)",
                transform: "translate(-50%, -50%)",
                borderColor: "rgba(75, 40, 255, 0.22)",
                background: "rgba(255, 255, 255, 0.45)",
                willChange: "transform, opacity",
              }}
            >
              <span
                className="text-[8px] tracking-[0.12em] sm:text-[9px]"
                style={{
                  fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                  color: "rgba(3, 2, 11, 0.4)",
                }}
              >
                DAY {spec.idx + 1}
              </span>
              <span
                className="hidden text-[8px] sm:block"
                style={{
                  fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                  color: "rgba(3, 2, 11, 0.3)",
                }}
              >
                {spec.note}
              </span>
            </div>
          ))}
        </div>

        {/* ── Quarter label. */}
        <div
          ref={labelRef}
          aria-hidden
          className="absolute z-[2] whitespace-nowrap text-center"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            willChange: "transform, opacity",
          }}
        >
          <div className="animate-fade-in">
            <p
              className="font-semibold text-foreground/85"
              style={{ fontSize: "clamp(52px, 9vw, 150px)", letterSpacing: "-0.05em", lineHeight: 1 }}
            >
              ONE QUARTER
            </p>
            <p
              className="mt-3 text-[11px] tracking-[0.26em] text-foreground/50 sm:text-[13px]"
              style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
            >
              HOW AGENCIES SEE YOUR PROJECT · 90 DAYS
            </p>
          </div>
        </div>

        {/* ── Scroll cue. */}
        <div
          ref={cueRef}
          aria-hidden
          className="absolute z-[5] flex -translate-x-1/2 flex-col items-center gap-3"
          style={{ left: "50%", bottom: 26, willChange: "opacity" }}
        >
          <span
            className="text-[10px] tracking-[0.26em] text-foreground/50"
            style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
          >
            SCROLL — CRUSH THE QUARTER
          </span>
          <span className="relative block h-14 w-px overflow-hidden bg-foreground/15">
            <span className="scroll-cue-trail absolute left-0 top-0 h-3 w-px bg-primary" />
          </span>
        </div>

        {/* ── Atmosphere: bloom behind the sentence + remnant dust. */}
        <div
          ref={bloomRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            opacity: 0,
            background: [
              "radial-gradient(50% 36% at 50% 46%, rgba(189, 112, 246, 0.2) 0%, rgba(189, 112, 246, 0) 70%)",
              "radial-gradient(72% 50% at 50% 46%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 75%)",
            ].join(", "),
            willChange: "opacity",
          }}
        />
        <div
          ref={motesRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{ opacity: 0, willChange: "opacity" }}
        >
          {MOTES.map((m, i) => (
            <span
              key={i}
              className="mote-drift absolute rounded-full"
              style={{
                left: m.left,
                top: m.top,
                width: m.size,
                height: m.size,
                opacity: m.opacity,
                background: "#4b28ff",
                animationDelay: m.delay,
              }}
            />
          ))}
        </div>

        {/* ── THE SENTENCE — pipeline, headline, sub, LIVE row. */}
        <div
          ref={headWrapRef}
          className="absolute inset-x-0 z-[5] px-6 text-center"
          style={{ top: "30%", opacity: 0, willChange: "opacity" }}
        >
          {/* pipeline chips — SPEC → BUILD → SHIP */}
          <div
            aria-hidden
            className="mb-10 flex items-center justify-center gap-7"
            style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
          >
            {PIPELINE.map((p, i) => (
              <Fragment key={p.label}>
                {i > 0 ? <span className="h-px w-8 bg-foreground/20" /> : null}
                <span
                  ref={(el) => {
                    pipelineRefs.current[i] = el;
                  }}
                  className="flex items-center gap-2 text-[11px] tracking-[0.24em] text-foreground"
                  style={{ opacity: 0.35, transition: "opacity 0.3s ease" }}
                >
                  <i
                    className="block h-[7px] w-[7px] rounded-full not-italic"
                    style={{ background: "rgba(3, 2, 11, 0.18)" }}
                  />
                  {p.label}
                </span>
              </Fragment>
            ))}
          </div>

          <h1
            ref={sentenceRef}
            id="process-hero-heading"
            className="relative mx-auto inline-block font-medium text-foreground"
            style={{ fontSize: "clamp(48px, 7.6vw, 128px)", letterSpacing: "-0.05em", lineHeight: 1.06 }}
          >
            {HEADLINE_WORDS.map((w, i) => (
              <Fragment key={i}>
                <span className="relative inline-block whitespace-nowrap">
                  <span
                    aria-hidden
                    style={{
                      color: "transparent",
                      WebkitTextStroke: "1.2px rgba(75, 40, 255, 0.3)",
                      ...(w.accent && {
                        fontFamily: "var(--font-instrument-serif), Georgia, serif",
                        fontStyle: "italic",
                        fontWeight: 400,
                      }),
                    }}
                  >
                    {w.text}
                  </span>
                  {/* dashed spec frame + mono annotation (design-tool draft) */}
                  <span
                    aria-hidden
                    ref={(el) => {
                      wordFrameRefs.current[i] = el;
                    }}
                    className="absolute rounded-md border border-dashed"
                    style={{ inset: "-0.07em -0.05em", borderColor: "rgba(75, 40, 255, 0.4)", opacity: 0 }}
                  >
                    <i className="absolute h-[7px] w-[7px] rounded-[2px] border bg-white" style={{ left: -4, top: -4, borderColor: "rgba(75,40,255,0.6)" }} />
                    <i className="absolute h-[7px] w-[7px] rounded-[2px] border bg-white" style={{ right: -4, top: -4, borderColor: "rgba(75,40,255,0.6)" }} />
                    <i className="absolute h-[7px] w-[7px] rounded-[2px] border bg-white" style={{ left: -4, bottom: -4, borderColor: "rgba(75,40,255,0.6)" }} />
                    <i className="absolute h-[7px] w-[7px] rounded-[2px] border bg-white" style={{ right: -4, bottom: -4, borderColor: "rgba(75,40,255,0.6)" }} />
                    {w.spec ? (
                      <span
                        className="absolute whitespace-nowrap text-[10px] font-normal tracking-[0.18em] not-italic"
                        style={{
                          top: "-1.7em",
                          left: 0,
                          fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                          color: "rgba(75, 40, 255, 0.55)",
                          WebkitTextStroke: "0px transparent",
                        }}
                      >
                        {w.spec}
                      </span>
                    ) : null}
                  </span>
                  <span
                    ref={(el) => {
                      wordBuiltRefs.current[i] = el;
                    }}
                    className="absolute inset-0"
                    style={{
                      clipPath: "inset(-0.2em 100% -0.2em 0)",
                      color: w.accent ? "#4b28ff" : "#0a0718",
                      ...(w.accent && {
                        fontFamily: "var(--font-instrument-serif), Georgia, serif",
                        fontStyle: "italic",
                        fontWeight: 400,
                        textShadow: "0 0 40px rgba(189, 112, 246, 0.45)",
                      }),
                      willChange: "clip-path",
                    }}
                  >
                    {w.text}
                  </span>
                </span>
                {/* inter-word space lives OUTSIDE the inline-block word */}
                {i < HEADLINE_WORDS.length - 1 ? " " : null}
              </Fragment>
            ))}
            <span
              aria-hidden
              ref={cursorRef}
              className="absolute w-[3px] rounded-full"
              style={{ background: "#4b28ff", boxShadow: "0 0 14px rgba(75, 40, 255, 0.7)", opacity: 0 }}
            />
          </h1>

          <p
            ref={subRef}
            className="mx-auto mt-7 max-w-[58ch] text-balance text-base leading-[1.55] text-foreground-mid sm:text-lg"
            style={{ opacity: 0 }}
          >
            Fourteen days, weekends included, nothing hidden. A demo every
            Friday. Live in production by the second one.
          </p>
        </div>

        {/* ── LIVE row — stamps beneath the sentence with a ripple. */}
        <div
          ref={pillRingRef}
          aria-hidden
          className="pointer-events-none absolute z-[4] rounded-full border-2"
          style={{
            left: "50%",
            top: "76%",
            width: 150,
            height: 150,
            transform: "translate(-50%, -50%) scale(0.4)",
            opacity: 0,
            borderColor: "rgba(0, 166, 86, 0.5)",
            willChange: "transform, opacity",
          }}
        />
        <div
          ref={liveRowRef}
          aria-hidden
          className="absolute z-[5] flex flex-wrap items-center justify-center gap-x-5 gap-y-3"
          style={{
            left: "50%",
            top: "74%",
            transform: "translateX(-50%)",
            opacity: 0,
            willChange: "transform, opacity",
          }}
        >
          <span
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-[11px] tracking-[0.16em]"
            style={{
              fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
              color: "#03020b",
              borderColor: "rgba(3, 2, 11, 0.2)",
              background: "rgba(255, 255, 255, 0.85)",
              boxShadow: "0 8px 28px rgba(75, 40, 255, 0.16)",
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: "#00a656", boxShadow: "0 0 10px #00a656" }}
            />
            LIVE IN PRODUCTION · v1.0.0 · FRI W2 14:42
          </span>
          <span
            className="whitespace-nowrap text-[10px] tracking-[0.2em] text-foreground/40"
            style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
          >
            <span style={{ textDecoration: "line-through" }}>90 DAYS</span>
            <span className="text-primary"> → 14</span>
          </span>
        </div>

        {/* SR summary */}
        <p className="sr-only">
          Agencies plan in quarters — ninety days. We crush it to two
          calendar weeks: spec, build, ship — fourteen days, weekends
          included, a demo every Friday, live in production by the second
          one.
        </p>
      </div>
    </section>
  );
}
