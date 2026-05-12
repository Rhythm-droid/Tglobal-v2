"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/cn";

/* ImageParticleField — text-pixel particle stage that MORPHS on text change.
   ─────────────────────────────────────────────────────────────
   On mount: samples pixel positions from the rendered word and
   spawns a particle at each one. Pointer-disperse + ambient drift
   come for free.

   When the `text` prop changes WITHOUT remounting the canvas:
     1. New target points are sampled from the new word.
     2. Each existing particle gets a new origin (re-mapped from
        the new point set).
     3. Each particle is kicked outward from canvas centre with a
        randomised velocity — "scatter".
     4. A per-particle scatterT timer suppresses the homing ease
        for ~0.8s so the scatter is visible before magnetism
        pulls them back to the new origin. The result: SPEED
        atomises, swirls, and re-forms as JUDGMENT.

   Particles, width, height, and the latest text live in refs so
   the rAF loop can pick up changes between renders without being
   torn down. The main setup effect only re-runs on reduceMotion /
   inView changes — NOT on text change. */

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  size: number;
  vx: number;
  vy: number;
  color: string;
  friction: number;
  ease: number;
  phase: number;
  // 1 right after scatter, decays to 0 — suppresses homing ease while > 0.
  scatterT: number;
  ambient: boolean;
  // Drift multiplier for ambient particles. Larger particles drift
  // slower (foreground depth), smaller drift faster (background) so
  // the field reads as layered atmosphere instead of a flat dust plane.
  driftSpeed: number;
  // Per-particle opacity multiplier. Lets ambient embers fade in/out
  // gently instead of popping at canvas edges when they wrap.
  alpha: number;
}

interface PointerState {
  x: number;
  y: number;
  active: boolean;
}

interface ImageParticleFieldProps {
  className?: string;
  text?: string;
  /** Optional override for the particle color palette. Defaults to the
      softer lavender family used on the about triptych. Pass an array
      of `rgba(...)` color strings; particles pick uniformly from it. */
  colors?: readonly string[];
}

const DEFAULT_COLORS = [
  "rgba(255, 255, 255, 0.85)",
  "rgba(231, 223, 253, 0.85)", // soft lavender
  "rgba(197, 186, 255, 0.85)", // primary tint
  "rgba(189, 112, 246, 0.7)",  // accent violet (muted)
  "rgba(245, 212, 203, 0.7)",  // soft warm
] as const;

export default function ImageParticleField({
  className,
  text = "TGLOBAL",
  colors,
}: ImageParticleFieldProps): JSX.Element {
  const palette = colors ?? DEFAULT_COLORS;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduceMotion = useReducedMotion();
  const [inView, setInView] = useState(false);

  // Mutable state that must survive text-prop changes without
  // tearing down the canvas/rAF loop.
  const particlesRef = useRef<Particle[]>([]);
  const widthRef = useRef(0);
  const heightRef = useRef(0);
  const textRef = useRef(text);
  const paletteRef = useRef<readonly string[]>(palette);
  const prevTextRef = useRef<string | null>(null);
  /* Bridge ref — the canvas/setup effect creates the `draw` closure
     bound to its canvas + context + reduceMotion. The rAF lifecycle
     effect (separate, depends on inView) calls draw via this ref so
     setup doesn't have to re-run every time inView toggles. Without
     this split, scrolling past the section forced a full particle
     rebuild + re-attached observers + new listeners — particles
     would visibly snap back to their text positions every time. */
  const drawFnRef = useRef<((time: number) => void) | null>(null);

  // Keep the palette ref current so re-samples after a color prop
  // change use the new palette without remounting.
  paletteRef.current = palette;

  /* Pause the rAF loop entirely when the canvas is offscreen.
     This is the heaviest paint on the page (10k+ particles redrawn per
     frame) so leaving it running while the user scrolls through other
     sections wastes a lot of GPU. IntersectionObserver gates the loop. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setInView(e.isIntersecting);
      },
      { rootMargin: "200px", threshold: 0 },
    );
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  /* Sample text-pixel positions into an array of points. Same sizing
     rule the original used so the morph keeps the word legible on
     mobile and desktop. Points are shuffled so that when we wrap
     (more particles than points or vice versa) coverage is uniform
     instead of always clustered top-left. */
  const samplePoints = (
    w: number,
    h: number,
    t: string,
  ): Array<{ x: number; y: number }> => {
    const off = document.createElement("canvas");
    const ctx = off.getContext("2d", { willReadFrequently: true });
    if (!ctx) return [];
    off.width = w;
    off.height = h;

    const targetWidth = w * 0.86;
    let fontSize = Math.min(w * 0.22, 320);
    ctx.font = `900 ${fontSize}px "Albert Sans", system-ui, -apple-system, sans-serif`;
    const measured = ctx.measureText(t).width;
    if (measured > targetWidth) {
      fontSize = (fontSize * targetWidth) / measured;
      ctx.font = `900 ${fontSize}px "Albert Sans", system-ui, -apple-system, sans-serif`;
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(t, w / 2, h / 2);

    const data = ctx.getImageData(0, 0, w, h).data;
    const step =
      w < 768
        ? Math.max(2, Math.floor(w / 160))
        : Math.max(3, Math.floor(w / 320));

    const points: Array<{ x: number; y: number }> = [];
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const i = (y * w + x) * 4;
        if (data[i + 3] > 128) points.push({ x, y });
      }
    }

    for (let i = points.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [points[i], points[j]] = [points[j], points[i]];
    }
    return points;
  };

  // Main setup — runs once on mount + when reduceMotion / inView change.
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !context) return;

    const pointer: PointerState = { x: -9999, y: -9999, active: false };
    const shouldReduceMotion = reduceMotion === true;

    const buildParticles = () => {
      const w = widthRef.current;
      const h = heightRef.current;
      if (!w || !h) return;
      const points = samplePoints(w, h, textRef.current);
      const currentPalette = paletteRef.current;

      const newParticles: Particle[] = [];
      for (const pt of points) {
        const color =
          currentPalette[Math.floor(Math.random() * currentPalette.length)];
        newParticles.push({
          x: pt.x,
          y: pt.y,
          originX: pt.x,
          originY: pt.y,
          size: Math.random() * 1.5 + 0.8,
          vx: 0,
          vy: 0,
          color,
          /* Faster formation tuning. Higher ease + lower friction
             means particles snap to their text position within
             ~0.6s of mount instead of drifting for 3+ seconds. */
          friction: Math.random() * 0.04 + 0.78,
          ease: Math.random() * 0.06 + 0.12,
          phase: Math.random() * Math.PI * 2,
          scatterT: 0,
          ambient: false,
          driftSpeed: 1,
          alpha: 1,
        });
      }

      /* Ambient drift — TWO tiers for atmospheric depth:
         - Near tier:  large (2.4–4.5px), low alpha, slow drift.
                       Reads as soft foreground motes.
         - Far tier:   tiny (0.4–1.2px), low alpha, faster drift.
                       Reads as distant background dust.
         The tier split is what makes the field feel like ATMOSPHERE
         rather than a flat scatter of identical dots. */
      const ambientTotal = Math.floor((w * h) / 28000);
      const nearCount = Math.floor(ambientTotal * 0.38);
      const farCount = ambientTotal - nearCount;

      for (let i = 0; i < nearCount; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        newParticles.push({
          x,
          y,
          originX: x,
          originY: y,
          size: Math.random() * 2.1 + 2.4,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          color: "rgba(231, 223, 253, 1)",
          friction: 0.99,
          ease: 0.01,
          phase: Math.random() * Math.PI * 2,
          scatterT: 0,
          ambient: true,
          driftSpeed: 0.35,
          alpha: 0.12 + Math.random() * 0.1,
        });
      }
      for (let i = 0; i < farCount; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        newParticles.push({
          x,
          y,
          originX: x,
          originY: y,
          size: Math.random() * 0.8 + 0.4,
          vx: (Math.random() - 0.5) * 1.4,
          vy: (Math.random() - 0.5) * 1.4,
          color: "rgba(255, 255, 255, 1)",
          friction: 0.99,
          ease: 0.01,
          phase: Math.random() * Math.PI * 2,
          scatterT: 0,
          ambient: true,
          driftSpeed: 1.1,
          alpha: 0.18 + Math.random() * 0.12,
        });
      }
      particlesRef.current = newParticles;
      // Mark prevTextRef so the text-change effect doesn't fire a
      // spurious scatter on the very first render.
      prevTextRef.current = textRef.current;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      widthRef.current = rect.width;
      heightRef.current = rect.height;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
      /* Always render one initial frame after a resize, regardless of
         the inView gate. Without this, the canvas stays blank from
         mount until the IntersectionObserver fires `inView=true` and
         the rAF loop starts — which can leave the word completely
         missing on first paint if the user lands inside the section
         (deep link / refresh-at-anchor) or the observer hasn't
         resolved yet. One static frame guarantees the particle word
         is visible immediately; the rAF loop takes over for motion
         the moment inView resolves. */
      draw(0);
    };

    const draw = (time: number) => {
      const w = widthRef.current;
      const h = heightRef.current;
      if (!w || !h) return;

      context.clearRect(0, 0, w, h);

      const timeSec = time * 0.001;
      const particles = particlesRef.current;

      /* Bloom — text particles get a lavender shadowBlur halo
         (palette-matched glow → embers, not pixels). Ambient
         particles skip the bloom in the loop below for perf:
         setting shadowBlur = 0 routes the fill through the fast
         canvas path, so only text-particle fills pay the blurred
         draw cost. shadowColor stays constant; we only toggle
         shadowBlur per-particle. */
      context.shadowColor = "rgba(189, 112, 246, 0.55)";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (p.ambient && !shouldReduceMotion) {
          // Tiered drift: large near-particles drift slowly, small
          // far-particles drift faster — parallax illusion.
          p.x += Math.sin(timeSec + p.phase) * 0.5 * p.driftSpeed;
          p.y += Math.cos(timeSec * 0.8 + p.phase) * 0.5 * p.driftSpeed;
          p.x += p.vx * p.driftSpeed;
          p.y += p.vy * p.driftSpeed;
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;
        } else if (!shouldReduceMotion) {
          const dx = p.originX - p.x;
          const dy = p.originY - p.y;

          /* During scatter, suppress the homing ease so particles
             fly outward instead of immediately being pulled back.
             scatterT decays each frame; ease re-engages as it falls. */
          const easeMul =
            p.scatterT > 0 ? Math.max(0, 1 - p.scatterT * 1.2) : 1;
          if (p.scatterT > 0)
            p.scatterT = Math.max(0, p.scatterT - 0.02);

          // Pointer-driven disperse interaction.
          if (pointer.active) {
            const mdx = pointer.x - p.x;
            const mdy = pointer.y - p.y;
            const dist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (dist < 120) {
              const force = (120 - dist) / 120;
              const angle = Math.atan2(mdy, mdx);
              p.vx -= Math.cos(angle) * force * 5;
              p.vy -= Math.sin(angle) * force * 5;
            }
          }

          // Move towards origin (suppressed during scatter).
          p.vx += dx * p.ease * easeMul;
          p.vy += dy * p.ease * easeMul;
          p.vx *= p.friction;
          p.vy *= p.friction;

          p.x += p.vx;
          p.y += p.vy;

          // Tiny floating noise — keeps the formed word breathing.
          p.x += Math.sin(timeSec * 2 + p.phase) * 0.5;
          p.y += Math.cos(timeSec * 2.5 + p.phase) * 0.5;
        }

        // Ambient particles use per-particle alpha + skip the heavy
        // bloom (cheaper, and their soft drift doesn't need a glow).
        if (p.ambient) {
          context.shadowBlur = 0;
          context.globalAlpha = p.alpha;
        } else {
          context.shadowBlur = 9;
          context.globalAlpha = 1;
        }
        context.fillStyle = p.color;
        context.beginPath();
        context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        context.fill();
      }

      // Reset canvas state before drawing filaments (no glow, full alpha).
      context.shadowBlur = 0;
      context.globalAlpha = 1;

      // Subtle connecting filaments between close particles.
      if (!shouldReduceMotion) {
        context.lineWidth = 0.5;
        const checkLimit = Math.min(particles.length, 500);
        for (let i = 0; i < checkLimit; i += 2) {
          const a = particles[i];
          for (let j = i + 1; j < checkLimit; j += 4) {
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = dx * dx + dy * dy;
            if (dist < 3600) {
              const alpha = (1 - dist / 3600) * 0.15;
              context.strokeStyle = `rgba(197, 186, 255, ${alpha})`;
              context.beginPath();
              context.moveTo(a.x, a.y);
              context.lineTo(b.x, b.y);
              context.stroke();
            }
          }
        }
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerleave", onPointerLeave);

    /* Publish `draw` to the bridge ref so the rAF lifecycle effect
       below can invoke it without re-running this whole setup when
       `inView` toggles. The closure captures canvas + context +
       pointer + shouldReduceMotion — those don't change between
       inView transitions, so the bridge stays valid. */
    drawFnRef.current = draw;

    return () => {
      observer.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      drawFnRef.current = null;
    };
  }, [reduceMotion]);

  /* rAF lifecycle — separate from canvas setup so scroll-driven
     inView toggles only start/stop the animation loop instead of
     tearing the entire canvas down and re-sampling all particles.
     reduceMotion is a dep so accessibility users skip the rAF
     entirely (the static draw painted during resize is enough). */
  useEffect(() => {
    if (reduceMotion === true || !inView) return;
    let frame = window.requestAnimationFrame(function tick(time) {
      drawFnRef.current?.(time);
      frame = window.requestAnimationFrame(tick);
    });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reduceMotion, inView]);

  /* Text change — morph between words.
     Re-samples the new word, re-assigns each particle's origin to a
     new point, and kicks each particle outward from canvas centre
     with a random velocity. The scatterT timer suppresses homing for
     ~0.8s so the eye reads it as: explode → re-form. */
  useEffect(() => {
    textRef.current = text;
    const w = widthRef.current;
    const h = heightRef.current;
    // Skip if canvas hasn't measured yet (initial paint — the main
    // setup effect handles first placement) or if text hasn't changed.
    if (!w || !h) return;
    if (prevTextRef.current === text) return;
    prevTextRef.current = text;

    const points = samplePoints(w, h, text);
    if (points.length === 0) return;

    const particles = particlesRef.current;
    const cx = w / 2;
    const cy = h / 2;
    let pi = 0;
    for (const p of particles) {
      if (p.ambient) continue;
      const target = points[pi % points.length];
      pi++;
      p.originX = target.x;
      p.originY = target.y;

      // Outward velocity from canvas centre. Magnitude is large
      // enough that the particles visibly fly out before homing
      // overrides them. A perpendicular jitter prevents the scatter
      // from looking radially symmetric.
      const ax = p.x - cx;
      const ay = p.y - cy;
      const len = Math.hypot(ax, ay) || 1;
      const ux = ax / len;
      const uy = ay / len;
      const speed = 5 + Math.random() * 10;
      const jitter = (Math.random() - 0.5) * 8;
      p.vx = ux * speed + -uy * jitter;
      p.vy = uy * speed + ux * jitter;
      p.scatterT = 1;
    }
  }, [text]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("h-full w-full", className)}
    />
  );
}
