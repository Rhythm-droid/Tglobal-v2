"use client";

import { useEffect, useRef, useState, type JSX } from "react";

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
  /* Particle field runs full motion for every visitor — brand decision.
     The internal branches that previously short-circuited under
     reduced-motion (skipping the rAF loop, drawing a static frame)
     are pinned to the animated path via this constant. Leaving the
     reference in place rather than threading a refactor through ~30
     usage sites keeps the diff focused. */
  const reduceMotion = false as const;
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

  /* Sample text-pixel positions into an array of points. Sizing
     rules below are derived from an /about audit across 1440 / 1024
     / 768 / 390 / 360 viewports — old formula (w * 0.22) capped
     fontSize at ~86px on iPhone 14 and ~169px on iPad portrait,
     which combined with a fixed 3px sample grid produced hollow
     letter outlines (the moiré between font anti-aliasing and the
     sample step). The new formula scales fontSize by the shorter
     viewport dimension AND scales `step` by fontSize so dot density
     stays uniform from mobile to wide desktop. */
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

    /* targetWidth caps the rendered word at 80% of the canvas so
       single glyphs never butt against the left/right edges.
       Italic-style serifs and the "N" verticals in particular
       overhang their measureText advance-width — capping at 0.80
       (not 0.86) gives the right edge enough breathing room so the
       last glyph never clips against the canvas right boundary at
       narrow viewports. The fontSize start scales with BOTH
       dimensions:
         w * 0.40   — wide-aspect viewports (mobile portrait, ~half
                      the previous baseline since w is small)
         h * 0.55   — tall-aspect viewports (iPad portrait, where
                      the canvas is taller than wide and the word
                      would otherwise sit lonely in a tall frame)
         400        — absolute cap so wide desktops (h * 0.55 = 495
                      on 900-tall viewports) don't pump the word
                      past the design's tested reading scale.
       The `measureText` shrink step still runs after, so a long
       word that overflows targetWidth at the starting fontSize
       still gets scaled down to fit. */
    /* targetWidth caps the rendered word at 65% of the canvas
       width (was 80%). The tighter cap is a defensive backstop for
       cases where the loaded font isn't what samplePoints expects:
       even if a fallback face renders ~50% wider per glyph, the
       measureText-driven shrink step still keeps the word inside
       the canvas. 65% leaves enough horizontal margin that the
       widest visible glyph (italic stroke overhang, bold serif
       caps) never bleeds against the right edge regardless of
       which face the browser actually renders. */
    const targetWidth = w * 0.65;
    let fontSize = Math.min(w * 0.32, h * 0.48, 320);
    /* Font-weight MUST match a weight that's actually loaded for
       Albert Sans. The brand bundle ships 400/500/600/700 only —
       NO 900 weight. Requesting 900 forced browsers to either
       synthetic-bold the 700 face (Chromium on Linux) OR fall
       through to the next font-family entry. On Windows that
       fallback was `system-ui` → Segoe UI Black, whose advance-
       width on the same nominal fontSize is ~60% wider than the
       intended Albert Sans glyph. The triptych SHIP / TASTE / OWN
       rendered MUCH larger on Windows than on Linux/macOS, often
       bleeding past the right viewport edge. Pinning to 700 makes
       every platform render the same actually-loaded face. */
    const FONT_FAMILY =
      '700 var(--fs) "Albert Sans", system-ui, -apple-system, sans-serif';
    ctx.font = FONT_FAMILY.replace("var(--fs)", `${fontSize}px`);
    const measured = ctx.measureText(t).width;
    if (measured > targetWidth) {
      fontSize = (fontSize * targetWidth) / measured;
      ctx.font = FONT_FAMILY.replace("var(--fs)", `${fontSize}px`);
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(t, w / 2, h / 2);

    const data = ctx.getImageData(0, 0, w, h).data;
    /* `step` sets the sample grid density. Scaling it by fontSize
       keeps dot density constant relative to letter STROKE WIDTH,
       so letters always read as solid blocks regardless of
       viewport. fontSize / 90 gives:
         390 vw (fontSize 156)  → step 2  (dense, mobile)
         768 vw (fontSize 259)  → step 3  (dense, tablet)
         1440 vw (fontSize 400) → step 4  (matches the design's
                                  original desktop density)
       Floor at 2 so a single pixel never gets missed at extreme
       small fontSizes. */
    const step = Math.max(2, Math.floor(fontSize / 90));

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
    /* `reduceMotion` is the locked-false constant declared above; the
       boolean is preserved so a future flip back to a real prefers-
       reduced-motion gate only has to change the constant, not every
       downstream call site. */
    const shouldReduceMotion: boolean = reduceMotion;
    /* Mobile perf gate. Canvas widths under 640px drop the two most
       expensive Canvas2D ops:
         • shadowBlur (per-particle Gaussian blur — ~3× fill cost)
         • inter-particle filament strokes (O(n²) within a 500-cap,
           still meaningful at 6k+ text particles)
       Together these account for ~70% of the per-frame paint cost on
       phones. The particle word itself is the hero; the bloom + web
       are atmosphere that disproportionately hurt mobile FPS. We
       check the canvas's actual rendered width (not viewport) so
       desktop-zoomed-narrow still pays the full fidelity. */
    const isMobile = () => widthRef.current > 0 && widthRef.current < 640;

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
         rather than a flat scatter of identical dots.
         Density divisor `28000` on desktop, `48000` under 640px
         canvas width — the smaller canvas already concentrates the
         ambient field, so the desktop divisor would oversample on
         mobile and add unnecessary fill cost. */
      const isMobileCanvas = w < 640;
      const ambientTotal = Math.floor((w * h) / (isMobileCanvas ? 48000 : 28000));
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
        // Mobile also skips bloom on TEXT particles — `isMobile()`
        // returns true under 640px canvas width. The bloom on mobile
        // adds ~50% per-frame cost for a halo that's barely visible
        // at small font sizes anyway; killing it brings the section
        // from ~24fps to a consistent 60fps on iPhone SE.
        if (p.ambient || isMobile()) {
          context.shadowBlur = 0;
          context.globalAlpha = p.ambient ? p.alpha : 1;
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
      // Skipped on mobile (canvas width < 640px) — the O(n²) inner
      // loop, even capped at 500 particles, is the second-largest
      // per-frame cost after bloom. Filament glow reads as ornament
      // on desktop but is barely visible at phone DPRs and isn't
      // worth the ~15ms/frame hit on iPhone SE.
      if (!shouldReduceMotion && !isMobile()) {
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
    /* Re-sample particle positions once Albert Sans 700 finishes
       loading. The initial resize() above may run BEFORE the brand
       font is ready; on that first run, ctx.measureText falls back
       to `system-ui` (Segoe UI Black on Windows, ~60% wider advance-
       width than Albert Sans) and the resulting sample grid + dot
       positions are sized to a system font that the user never
       actually sees. When the real font streams in via next/font's
       async pipeline, document.fonts.ready resolves and we re-sample
       with the correct font — particles snap to the intended layout.
       Calling buildParticles() directly (instead of resize()) skips
       the canvas pixel-buffer reset since dimensions haven't changed;
       only the sample points need updating. */
    document.fonts.ready
      .then(() => {
        if (widthRef.current > 0 && heightRef.current > 0) {
          buildParticles();
          drawFnRef.current?.(0);
        }
      })
      .catch(() => {
        // document.fonts.ready can't reject in practice; no-op fallback.
      });
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
    // `reduceMotion` is a locked-false constant today; widened to boolean
    // so this gate keeps working if the constant flips back to a real prop.
    if ((reduceMotion as boolean) || !inView) return;
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
