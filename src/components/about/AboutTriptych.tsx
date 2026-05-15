"use client";

import { useEffect, useRef, useState } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { MeshGradient } from "@paper-design/shaders-react";

import ImageParticleField from "./ImageParticleField";
import { HERO_COLORS } from "./palette";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/* Triptych — Ship · Taste · Own, on one pinned light stage.
   ─────────────────────────────────────────────────────────────
   Mirrors the hero's pinning architecture: the section's intrinsic
   height = 300vh (one viewport of scroll per word). The pin element
   is absolutely positioned inside, h-100svh, pinned with
   pinSpacing: false. When the pin completes, the section ends at
   the same scroll position — Team is in viewport with zero gap.

   The particle canvas is a SINGLE persistent ImageParticleField.
   Its `text` prop is swapped as scroll progress crosses thresholds.
   Inside the canvas, the particles scatter outward then re-form
   into the new word (see ImageParticleField for the morph mechanics).

   Captions are rendered as siblings to the canvas. Each frame's
   caption fades in when its word becomes active and fades out as
   the next one assembles. Editorial captions stay in different
   corners across the three frames so the page-spread rhythm of
   the original triptych is preserved. */

const FRAMES = [
  {
    word: "Ship",
    index: "I",
    caption: "Decks don't deploy.",
    align: "left-top",
  },
  {
    word: "Taste",
    index: "II",
    caption: "Taste does not autocomplete.",
    align: "right-bottom",
  },
  {
    word: "Own",
    index: "III",
    caption: "Your codebase. From the first commit.",
    align: "center-bottom",
  },
] as const;

/* Background shader palette — now reuses the same HERO_COLORS as
   the hero MeshGradient so the entire page reads as one continuous
   light-lavender wash. Was a deep-ink family; reskinned when the
   hero went light to keep the page tonally coherent. */
const TRIPTYCH_COLORS = HERO_COLORS;

/* Particle palette — dark brand tones so the words read against
   the now-light shader background. Defaults to brand violet +
   ink with low-opacity soft variants so the particle cloud has
   depth without going flat-monochrome. */
const TRIPTYCH_PARTICLE_COLORS = [
  "rgba(14, 10, 30, 0.85)",   // deep ink
  "rgba(75, 40, 255, 0.75)",  // brand violet
  "rgba(107, 92, 231, 0.7)",  // muted lavender
  "rgba(45, 31, 94, 0.8)",    // dark violet
] as const;

type FrameAlign = (typeof FRAMES)[number]["align"];

const ALIGN_CLASSES: Record<FrameAlign, string> = {
  "left-top": "items-start justify-start text-left",
  "right-bottom": "items-end justify-end text-right",
  "center-bottom": "items-end justify-center text-center",
};

/* Word-index thresholds across the scrubbed pin range.
   Equal-thirds slicing (1/3 of pin per word) — paired with the
   pin's +=450% scroll length below, each word gets EXACTLY 1.5
   viewports of scroll to read. The previous unequal slicing
   (last word got the largest slice) was tuned for a shorter pin
   where the last word also handled the exit-wash beat — that's
   no longer required with the longer 450% pin where every frame
   has comfortable breathing room.
     0.00 – 0.33  → frame 0 (Ship)   — 1.5 viewports
     0.33 – 0.66  → frame 1 (Taste)  — 1.5 viewports
     0.66 – 1.00  → frame 2 (Own)    — 1.5 viewports
   Boundaries deliberately don't coincide with the snap stops
   below (midpoints 0.17 / 0.50 / 0.83). Snap-on-boundary lets
   the user rest exactly on a frame edge and the caption flickers
   between two frames as scroll micro-jitters; snap-at-midpoint
   guarantees each rest position is firmly INSIDE one frame's
   window with caption fully opaque and word fully resolved. */
const WORD_THRESHOLD_1 = 0.33;
const WORD_THRESHOLD_2 = 0.66;

function wordIndexFromProgress(p: number): number {
  if (p < WORD_THRESHOLD_1) return 0;
  if (p < WORD_THRESHOLD_2) return 1;
  return 2;
}

export default function AboutTriptych() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const captionRefs = useRef<Array<HTMLDivElement | null>>([null, null, null]);

  const [wordIndex, setWordIndex] = useState(0);
  const lastWordIndexRef = useRef(0);
  /* `reduceMotion` defaults to false so SSR + first client render
     both emit the animated tree (hydration-safe). After mount, if
     the media query matches `reduce`, ScrollTrigger is skipped and
     the section's height collapses to 1 viewport via the inline
     style below. The pin element stays in flow inside that single
     viewport, statically displaying SHIP. The caption refs are
     simultaneously cross-faded to show the full three captions
     stacked one above the other so the user reads all three
     principles statically. */
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    /* Initial sync with the OS media-query value is hydration-safe:
       state starts at `false` so SSR + first client render agree,
       then this fires once post-mount to pick up the real OS setting.
       This IS the correct external-system subscribe pattern. */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useGSAP(
    () => {
      /* Read the media query SYNCHRONOUSLY here instead of relying
         on the `reduceMotion` state below. Why: this hook runs once
         on mount BEFORE the useEffect that listens to the media
         query has fired (state useEffects are deferred). On that
         first run, `reduceMotion` is still `false` (initial state),
         so we'd create the ScrollTrigger pin — then the useEffect
         flips the state, this hook re-runs, the cleanup kills the
         pin BUT ScrollTrigger's pin-spacer DOM mutations sometimes
         linger, leaving the pinned canvas frozen `position: fixed`
         at viewport top across all 3 viewports. Reading the MQ
         synchronously here means the first run already knows the
         user's preference and never creates the pin in the first
         place. */
      const liveReduce =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion || liveReduce) return;
      const pin = pinRef.current;
      const section = sectionRef.current;
      if (!pin || !section) return;

      // Captions — frame 0 shown initially, others hidden.
      captionRefs.current.forEach((c, i) => {
        if (c) gsap.set(c, { opacity: i === 0 ? 1 : 0 });
      });

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        /* +=450% — four-and-a-half viewports of scroll, 1.5 per
           word. Bumped from +=300% (one viewport per word) because
           fast scrollers reported flying past TASTE/OWN before
           the captions had fully cross-faded into view. With 1.5
           viewports per frame, even an aggressive wheel-flick
           leaves each word visible for ~600ms minimum — long
           enough to read the principle, not so long that the
           reader gets bored. Previous iterations: 300% (skipped),
           400% (still tight at touch-flick velocity), 600% (dead
           zones between snap stops). 450% is the sweet spot. */
        end: "+=450%",
        scrub: 0.6,
        pin,
        /* pinSpacing: false — section height EQUALS pin distance,
           so when the pin completes the section ends at the same
           scroll position. No trailing gap. Same pattern as the
           hero pin. */
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        /* Snap stops sit at the MIDPOINT of each frame's band, not
           the boundary edges. Landing on a boundary leaves the
           caption mid-fade and the particle morph half-resolved
           — feels like the pin glitched past the frame. Midpoints
           guarantee each snap rest position shows one word fully
           formed with its caption fully opaque.
             0       → pin start (Hero handoff)
             0.17    → SHIP midpoint  ((0.00 + 0.33) / 2)
             0.50    → TASTE midpoint ((0.33 + 0.66) / 2)
             0.83    → OWN midpoint   ((0.66 + 1.00) / 2)
             1       → pin exit (Team handoff)
           Equal spacing between adjacent stops (~0.33 each)
           matches the equal-thirds frame slicing above — one
           wheel-tick advances exactly one word, every word holds
           a snap rest at its visual centre, no skipping under
           fast input. directional: true makes each wheel-tick
           advance ONE stop in the scroll direction, not the
           geometric nearest — fixes the "fast flick skips TASTE"
           bug from earlier iterations. */
        snap: {
          snapTo: [0, 0.17, 0.50, 0.83, 1],
          duration: { min: 0.15, max: 0.35 },
          delay: 0.05,
          directional: true,
          ease: "power2.inOut",
        },
        onUpdate: (self) => {
          const idx = wordIndexFromProgress(self.progress);
          if (idx === lastWordIndexRef.current) return;

          const prev = captionRefs.current[lastWordIndexRef.current];
          const next = captionRefs.current[idx];
          if (prev) {
            gsap.to(prev, { opacity: 0, duration: 0.35, ease: "power2.in" });
          }
          if (next) {
            gsap.to(next, { opacity: 1, duration: 0.6, ease: "power2.out" });
          }
          lastWordIndexRef.current = idx;
          setWordIndex(idx);
        },
      });

      return () => trigger.kill();
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  const activeFrame = FRAMES[wordIndex];

  return (
    <section
      ref={sectionRef}
      aria-label="The three principles, as one page-spread"
      /* DO NOT add `overflow-hidden` here. The section is the trigger
         for a `pinSpacing: false` ScrollTrigger pin — GSAP creates a
         `pin-spacer` wrapper around the pinned <div> and the pinned
         element flips `position: fixed` during the pin range. On
         mobile (iPhone SE 375×667 reproducer), having `overflow-hidden`
         on this <section> caused the pinned element to render
         clipped against the section's outer box AFTER the user
         scrolled past the pin's start: the pin-element's `top: 0` was
         resolved against the SECTION rather than the viewport on
         certain Safari/Chrome-mobile reflow paths, leaving the
         viewport's lower 70% blank lavender once SHIP scrolled past
         its anchor. The pin element ITSELF (one level down) carries
         `overflow-hidden` to clip particle/shader content — that
         clipping is still in place. The section just must not
         participate in the clipping chain. Match AboutHero, which
         intentionally keeps `relative isolate w-full` only. */
      data-pin-fix-v1="true"
      className="relative isolate w-full"
      style={{
        /* Section height MATCHES pin distance — pin = +=450% =
           4.5× viewport of scroll, so section height = 4.5
           viewports. The moment the pin releases at the bottom of
           the section, the next section (Team) is in viewport with
           zero gap. 4.5× gives each word 1.5 viewports of scroll
           (was 3× = 1 viewport/word, which fast scrollers reported
           skipping past TASTE/OWN before captions resolved).
           Both motion paths run at the SAME 4.5× height:
             • Animated: ScrollTrigger pins the canvas through 4.5
               viewports of scroll, morphing word + caption across
               SHIP → TASTE → OWN at 1.5 viewports each.
             • Reduced-motion: NO pin. Viewport 1–1.5 = pin element
               with SHIP particles + caption (the pin <div> still
               fills 100svh but the section now extends another 3
               viewports beneath it). Viewports 1.5–3.0 = TASTE
               coda block (1.5 viewports tall). Viewports 3.0–4.5
               = OWN coda block (1.5 viewports tall).
           Equal heights mean Team handoff lands at the same
           document Y regardless of motion preference. Equal per-
           word slots (1.5 viewports each) mean a fast scroller
           sees every word for the same duration on both paths. */
        height: "calc(var(--100vh, 100svh) * 4.5)",
        background: "var(--color-paper-alt, #f4eef9)",
      }}
    >
      {/* Pin element — viewport-filling stage. ScrollTrigger pins
          this for the ANIMATED path; the section's explicit height
          equals the pin distance so the handoff to Team has no gap.
          Under reduced motion the pin element is HIDDEN — the
          three reduced-motion frames below take over and each one
          renders its OWN particle word so the visual identity
          (particle scatter words) stays consistent across paths. */}
      <div
        ref={pinRef}
        className="absolute left-0 right-0 top-0 h-[100svh] w-full overflow-hidden"
        style={{ display: reduceMotion ? "none" : undefined }}
      >
        {/* ── Layer 0: Atmospheric shader ───────────────────────
            Low-saturation MeshGradient that breathes behind the
            particles. Slower than the hero's shader so the motion
            reads as ambience, not animation. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[0]">
          <MeshGradient
            style={{ width: "100%", height: "100%" }}
            colors={[...TRIPTYCH_COLORS]}
            distortion={0.6}
            swirl={0.45}
            grainMixer={0.32}
            grainOverlay={0.16}
            speed={0.18}
            maxPixelCount={1_440_000}
          />
        </div>

        {/* ── Layer 1: Vignette ─────────────────────────────────
            White scrim — keeps the particle word readable at
            frame edges without burning the light lavender
            shader to black. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(ellipse 75% 60% at 50% 50%, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0.3) 72%, rgba(255,255,255,0.55) 100%)",
          }}
        />

        {/* ── Layer 2: Particle word ────────────────────────────
            Single persistent canvas. The `text` prop change
            triggers the in-canvas scatter/reform morph. */}
        <ImageParticleField
          className="absolute inset-0 z-[2]"
          text={activeFrame.word.toUpperCase()}
          colors={[...TRIPTYCH_PARTICLE_COLORS]}
        />

        {/* Captions — one per frame. ScrollTrigger cross-fades
            them as the pinned word morphs. */}
        {FRAMES.map((frame, i) => (
          <div
            key={frame.word}
            ref={(el) => {
              captionRefs.current[i] = el;
            }}
            className={`pointer-events-none absolute inset-0 z-[3] flex flex-col gap-3 px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-24 xl:px-24 ${ALIGN_CLASSES[frame.align]}`}
            style={{ opacity: i === 0 ? 1 : 0 }}
          >
            <p className="editorial-label text-foreground-mid">
              <span className="tabular-nums">№ 04 · {frame.index}</span>
              <span aria-hidden className="h-px w-8 bg-foreground-mid/40" />
              <span>{frame.word}</span>
            </p>
            <p
              className="max-w-[34ch] italic text-foreground/85"
              style={{
                fontFamily: "var(--font-instrument-serif), Georgia, serif",
                fontSize: "clamp(20px, 1.7vw, 28px)",
                letterSpacing: "-0.01em",
                lineHeight: 1.35,
              }}
            >
              &ldquo;{frame.caption}&rdquo;
            </p>
          </div>
        ))}
      </div>

      {/* ─── Reduced-motion path ─────────────────────────────────
          Three stacked full-viewport particle frames, one per
          principle. Each one renders its OWN ImageParticleField so
          the particle-scatter word identity is preserved for
          motion-reduce users — they get the same visual treatment
          as motion-on users, just without the cross-frame morph
          animation (each word renders statically into its frame
          and stays). The MeshGradient shader from the animated
          path is intentionally OMITTED here — three simultaneous
          WebGL shaders on one page would be a heavy cost paid by
          exactly the audience asking the page to use less motion.
          The lavender section background shows through and is
          enough atmosphere.
          Layout positions match the section's 4.5-viewport height:
            0.0 – 1.5 viewports: SHIP frame
            1.5 – 3.0 viewports: TASTE frame
            3.0 – 4.5 viewports: OWN frame
          Each frame is 1.5 viewports tall so per-word scroll
          budget matches the animated path exactly — Team handoff
          lands at the same document Y on both paths. */}
      {reduceMotion &&
        FRAMES.map((frame, idx) => (
          <div
            key={frame.word}
            className="absolute left-0 right-0 z-[2] overflow-hidden"
            style={{
              top: `calc(var(--100vh, 100svh) * ${idx * 1.5})`,
              height: "calc(var(--100vh, 100svh) * 1.5)",
            }}
          >
            {/* Particle word — same component as the animated
                path uses, just rendered once per frame with a
                fixed text prop (no morph). */}
            <ImageParticleField
              className="absolute inset-0 z-[1]"
              text={frame.word.toUpperCase()}
              colors={[...TRIPTYCH_PARTICLE_COLORS]}
            />
            {/* Caption — same editorial corner placement as the
                animated path uses (ALIGN_CLASSES per frame), so the
                two paths share visual rhythm. */}
            <div
              className={`pointer-events-none absolute inset-0 z-[2] flex flex-col gap-3 px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-24 xl:px-24 ${ALIGN_CLASSES[frame.align]}`}
            >
              <p className="editorial-label text-foreground-mid">
                <span className="tabular-nums">№ 04 · {frame.index}</span>
                <span aria-hidden className="h-px w-8 bg-foreground-mid/40" />
                <span>{frame.word}</span>
              </p>
              <p
                className="max-w-[34ch] italic text-foreground/85"
                style={{
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                  fontSize: "clamp(20px, 1.7vw, 28px)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.35,
                }}
              >
                &ldquo;{frame.caption}&rdquo;
              </p>
            </div>
          </div>
        ))}
    </section>
  );
}
