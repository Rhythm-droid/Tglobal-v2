"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
  useMotionTemplate,
  useVelocity,
  type MotionValue,
} from "framer-motion";

import { PROCESS_STEPS } from "@/app/work/data";

/* ── Step text layers ───────────────────────────────────────────────
   Each step ZOOMS via CSS `scale` (a 2D transform about its centre — it
   cannot drift vertically in any browser, unlike translateZ+perspective),
   holds readable, then fades out exactly as the next begins to enter
   (tight cross-fade at each handoff). Centred purely by grid layout.

   Choreography (all scroll-scrubbed → deterministic, parity-safe):
   • the big word ASSEMBLES char-by-char out of the flight — each char
     focus-pulls (blur 5px→0, capped: Firefox/mobile-safe) + converges
     (scale 1.45→1) + fades in, on a staggered window;
   • the mono eyebrow's letter-spacing settles as it docks;
   • the description wipes in via clip-path inset (GPU-composited);
   • scroll VELOCITY shears the word (skewX) and splits violet colour
     fringes (plain text-shadow — no filter) like motion blur; both are
     spring-lerped so they never jitter and rest at exactly zero. */

/* Scroll windows per step: text assembles over [from→dock], holds, then
   the container fades over [fade→end] as the next step enters. */
const STEP_WINDOWS = [
  { from: 0.0, dock: 0.16, fade: 0.27, end: 0.4, scaleIn: 0.5, fades: true },
  { from: 0.27, dock: 0.5, fade: 0.61, end: 0.73, scaleIn: 0.36, fades: true },
  { from: 0.61, dock: 0.84, fade: 1, end: 1, scaleIn: 0.36, fades: false },
] as const;

/* One character of the big word, arriving from the flight: focus-pull
   (small capped blur), depth-convergence (scale), fade — each char on its
   own slightly-offset scrub window so the word assembles letter by
   letter. Transform/opacity + a ≤5px blur on one glyph (cheap). */
function DockChar({
  ch,
  mv,
  from,
  to,
}: {
  ch: string;
  mv: MotionValue<number>;
  from: number;
  to: number;
}) {
  const blur = useTransform(mv, [from, to], [5, 0], { clamp: true });
  const filter = useMotionTemplate`blur(${blur}px)`;
  const opacity = useTransform(mv, [from, to], [0, 1], { clamp: true });
  const scale = useTransform(mv, [from, to], [1.45, 1], { clamp: true });
  return (
    <motion.span
      aria-hidden
      className="inline-block will-change-transform"
      style={{ filter, opacity, scale }}
    >
      {ch}
    </motion.span>
  );
}

/* One full step layer (eyebrow + word + description), centred in the
   shared grid cell; owns all of its scrub windows. */
function StepLayer({
  step,
  mv,
  win,
  skewX,
  chroma,
}: {
  step: (typeof PROCESS_STEPS)[number];
  mv: MotionValue<number>;
  win: (typeof STEP_WINDOWS)[number];
  skewX: MotionValue<number>;
  chroma: MotionValue<string>;
}) {
  const { from, dock, fade, end, scaleIn, fades } = win;
  const scale = useTransform(mv, [from, dock, end], [scaleIn, 1, 1.55], { clamp: true });
  const opacity = useTransform(mv, [fade, end], fades ? [1, 0] : [1, 1], { clamp: true });

  /* Eyebrow: tracking settles from spaced-out to docked. */
  const ls = useTransform(mv, [from, dock], [0.55, 0.3], { clamp: true });
  const eyebrowLs = useMotionTemplate`${ls}em`;
  const eyebrowOp = useTransform(mv, [from, from + (dock - from) * 0.6], [0, 1], { clamp: true });

  /* Description: left→right clip-path wipe, just behind the word. */
  const clipPct = useTransform(mv, [from + (dock - from) * 0.5, dock + 0.02], [100, 0], { clamp: true });
  const clipPath = useMotionTemplate`inset(0 ${clipPct}% 0 0)`;
  const descOp = useTransform(mv, [from + (dock - from) * 0.5, dock], [0, 1], { clamp: true });

  /* Char stagger: spread across the first ~45% of the approach. */
  const chars = step.title.split("");
  const charTo = dock - (dock - from) * 0.05;

  return (
    <motion.div
      className="flex w-[min(90vw,720px)] flex-col items-center text-center will-change-transform [grid-area:1/1]"
      style={{ scale, opacity }}
    >
      <motion.p
        className="font-mono text-[11px] uppercase text-foreground/45 sm:text-xs"
        style={{
          fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
          letterSpacing: eyebrowLs,
          opacity: eyebrowOp,
        }}
      >
        Step {step.n}
      </motion.p>
      <motion.p
        className="mt-3 italic leading-[0.95]"
        style={{
          fontFamily: "var(--font-instrument-serif), Georgia, serif",
          fontSize: "clamp(64px, 12vw, 168px)",
          letterSpacing: "-0.02em",
          color: "var(--color-primary)",
          skewX,
          textShadow: chroma,
        }}
      >
        <span className="sr-only">{step.title}</span>
        {chars.map((ch, j) => (
          <DockChar
            key={j}
            ch={ch}
            mv={mv}
            from={from + (dock - from) * 0.45 * (j / chars.length)}
            to={charTo}
          />
        ))}
      </motion.p>
      <motion.p
        className="mt-5 max-w-[22rem] text-base leading-relaxed text-foreground/70 sm:text-lg"
        style={{ clipPath, opacity: descOp }}
      >
        {step.blurb}
      </motion.p>
    </motion.div>
  );
}

/* ── Corridor (canvas 2.5D) — the rushing perspective lines + dust that
   sell the flight. Full-bleed, behind the text. No station gates (the
   text layers are the content). */
const JOURNEY = 2000;
const GAP = 150;
const NEAR = 46;
const FARZ = 2600;

type Dust = { ox: number; oy: number; d: number; sp: number };
function makeDust(rand: () => number): Dust[] {
  const out: Dust[] = [];
  for (let i = 0; i < 150; i++) {
    out.push({
      ox: (rand() * 2 - 1) * (0.2 + rand() * 0.85),
      oy: (rand() * 2 - 1) * (0.2 + rand() * 0.85),
      d: rand() * (JOURNEY + 1400) - 300,
      sp: 0.6 + rand() * 0.8,
    });
  }
  return out;
}

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

function drawCorridor(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  dpr: number,
  v: number,
  vel: number,
  dust: Dust[],
) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h / 2;
  const focal = Math.max(w, h) * 0.62;
  const HW = w * 0.62;
  const HH = h * 0.62;
  const camZ = v * JOURNEY;
  const proj = (z: number) => focal / z;

  // perspective rails (corners → vanishing point)
  ctx.strokeStyle = "rgba(99,66,230,0.1)";
  ctx.lineWidth = 1;
  const e = proj(NEAR + 4);
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + sx * HW * e, cy + sy * HH * e);
    ctx.stroke();
  }

  // concentric frames rushing toward the camera
  for (let d = -260; d <= JOURNEY + 800; d += GAP) {
    const z = d - camZ;
    if (z <= NEAR || z > FARZ) continue;
    const s = proj(z);
    const hw = HW * s;
    const hh = HH * s;
    const far = z / FARZ;
    const near = Math.min(1, (z - NEAR) / 380);
    const a = (0.05 + 0.3 * (1 - far)) * near;
    ctx.strokeStyle = `rgba(99,66,230,${a})`;
    ctx.lineWidth = 1;
    rrect(ctx, cx - hw, cy - hh, hw * 2, hh * 2, Math.min(hw, hh) * 0.12);
    ctx.stroke();
  }

  // dust streaming toward the camera (streak ∝ scroll velocity)
  const streak = Math.min(0.2, Math.abs(vel) * 2.4);
  for (const p of dust) {
    const z = p.d - camZ;
    if (z <= NEAR || z > FARZ) continue;
    const s = proj(z);
    const px = cx + p.ox * HW * s;
    const py = cy + p.oy * HH * s;
    if (px < -20 || px > w + 20 || py < -20 || py > h + 20) continue;
    const a = Math.min(0.6, (1 - z / FARZ) * 0.8) * Math.min(1, (z - NEAR) / 200);
    if (streak > 0.002) {
      const s2 = proj(z + JOURNEY * streak * p.sp);
      ctx.strokeStyle = `rgba(140,104,250,${a})`;
      ctx.lineWidth = Math.max(0.7, s * 1.3);
      ctx.beginPath();
      ctx.moveTo(cx + p.ox * HW * s2, cy + p.oy * HH * s2);
      ctx.lineTo(px, py);
      ctx.stroke();
    } else {
      ctx.fillStyle = `rgba(140,104,250,${a})`;
      ctx.beginPath();
      ctx.arc(px, py, Math.max(0.7, s * 1.1), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * WorkProcessTeaser — "N° 05 — Playbook" as a full-bleed FLIGHT.
 *
 * A canvas corridor (perspective lines + dust rushing toward the camera,
 * warping with scroll velocity) flies behind, while the three steps
 * (name + description, real HTML in CSS 3D) rush out of the vanishing
 * point in turn — approach, hold readable, fly past. Corner labels frame
 * it: section marker top-left, "Full method" link bottom-right.
 *
 * Canvas 2.5D + CSS 3D — no WebGL, no large blur → 60fps, Firefox-safe.
 * All motion is scroll-position-bound (deterministic → reduced-motion
 * parity automatic). Step text is real DOM (accessible); canvas is
 * client-only (no SSR hydration surface).
 */
export default function WorkProcessTeaser() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastVRef = useRef(0);
  const [dust] = useState<Dust[]>(() => {
    let seed = 9301;
    return makeDust(() => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    });
  });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 110, damping: 32, mass: 0.4 });

  /* Velocity accents for the big word: shear + violet chromatic fringe,
     proportional to scrub speed. Spring-lerped (never jitters) and rests
     at exactly 0 when still → the at-rest frame is identical at any
     scroll offset (parity-safe). text-shadow, NOT filter — cheap and
     identical in Firefox. */
  const rawVel = useVelocity(smooth);
  const vel = useSpring(rawVel, { stiffness: 220, damping: 44, mass: 0.4 });
  const skewX = useTransform(vel, [-0.8, 0, 0.8], [4, 0, -4], { clamp: true });
  const fringe = useTransform(vel, (v) => Math.max(-3.5, Math.min(3.5, v * 6)));
  const chroma = useMotionTemplate`${fringe}px 0 0 rgba(189, 112, 246, 0.35), calc(${fringe}px * -1) 0 0 rgba(75, 40, 255, 0.28)`;

  const renderCanvas = (v: number, vel: number) => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cw = stage.clientWidth;
    const ch = stage.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(ch * dpr)) {
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
    }
    drawCorridor(ctx, cw, ch, dpr, v, vel, dust);
  };

  useMotionValueEvent(smooth, "change", (v) => {
    const vel = v - lastVRef.current;
    lastVRef.current = v;
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      renderCanvas(smooth.get(), vel);
    });
  });

  useEffect(() => {
    renderCanvas(smooth.get(), 0);
    const stage = stageRef.current;
    const ro = stage ? new ResizeObserver(() => renderCanvas(smooth.get(), 0)) : null;
    if (stage && ro) ro.observe(stage);
    return () => {
      ro?.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wash = [
    "radial-gradient(60% 45% at 22% 28%, #c5baff 0%, rgba(197, 186, 255, 0) 65%)",
    "radial-gradient(55% 45% at 78% 72%, #dcd1ff 0%, rgba(220, 209, 255, 0) 68%)",
    "radial-gradient(80% 60% at 50% 50%, #ede4ff 0%, rgba(237, 228, 255, 0) 72%)",
    "linear-gradient(180deg, #f6f1ff 0%, #ede4ff 100%)",
  ].join(", ");

  return (
    <section
      ref={sectionRef}
      aria-labelledby="process-teaser-heading"
      className="relative bg-background text-foreground"
    >
      <div ref={stageRef} className="sticky top-0 h-screen overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0" style={{ background: wash }} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
            backgroundSize: "240px 240px",
            opacity: 0.06,
            mixBlendMode: "overlay",
          }}
        />

        {/* corridor lines + dust (the zoom/flight) */}
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 z-[1]" />

        {/* corner labels */}
        <p
          id="process-teaser-heading"
          className="absolute left-6 top-6 z-[3] font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/55 sm:left-10 sm:top-10 sm:text-xs"
          style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
        >
          N° 05 — Playbook
        </p>
        <Link
          href="/process"
          className="focus-ring absolute bottom-6 right-6 z-[3] inline-flex items-baseline gap-2 rounded-md font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/55 transition-colors hover:text-foreground sm:bottom-10 sm:right-10 sm:text-xs"
          style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
        >
          Full method
          <span aria-hidden>→</span>
        </Link>

        {/* the step text zooming — centred by grid (every layer in one
            cell), only scale + opacity animate → never drifts vertically.
            Each layer assembles char-by-char as it docks (StepLayer). */}
        <div className="absolute inset-0 z-[2] grid place-items-center">
          {PROCESS_STEPS.map((step, i) => (
            <StepLayer
              key={step.n}
              step={step}
              mv={smooth}
              win={STEP_WINDOWS[i]}
              skewX={skewX}
              chroma={chroma}
            />
          ))}
        </div>
      </div>

      <div aria-hidden style={{ height: "210svh" }} />
    </section>
  );
}
