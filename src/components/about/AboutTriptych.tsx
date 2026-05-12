"use client";

import { useRef, useState } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { MeshGradient } from "@paper-design/shaders-react";

import ImageParticleField from "./ImageParticleField";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/* Triptych — Speed · Judgment · Care, on one pinned dark stage.
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

/* Background shader palette — same ink family as the hero but
   pulled darker and less saturated. The triptych is the page's
   tonal inhale, so the shader should breathe at the edge of
   perception, not compete with the particle word. */
const TRIPTYCH_COLORS = [
  "#06040f", // near-black ink
  "#0e0a1e", // deep ink
  "#1a1233", // ink-soft
  "#2d1f5e", // dark violet
  "#4b3a8a", // muted lavender
] as const;

type FrameAlign = (typeof FRAMES)[number]["align"];

const ALIGN_CLASSES: Record<FrameAlign, string> = {
  "left-top": "items-start justify-start text-left",
  "right-bottom": "items-end justify-end text-right",
  "center-bottom": "items-end justify-center text-center",
};

/* Word-index thresholds across the scrubbed pin range.
   0.00 – 0.25  → frame 0 (Ship)    — 1 viewport
   0.25 – 0.50  → frame 1 (Taste)   — 1 viewport
   0.50 – 1.00  → frame 2 (Own)     — 2 viewports
   Last word gets the largest slice so the scatter / reform / read
   beat fully resolves BEFORE the pin releases. Same pattern as
   the hero, where entry 2 got more scroll real estate than 0–1
   for the same reason. */
const WORD_THRESHOLD_1 = 0.25;
const WORD_THRESHOLD_2 = 0.50;

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

  useGSAP(
    () => {
      const pin = pinRef.current;
      const section = sectionRef.current;
      if (!pin || !section) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Captions — frame 0 shown initially, others hidden.
      captionRefs.current.forEach((c, i) => {
        if (c) gsap.set(c, { opacity: i === 0 ? 1 : 0 });
      });

      if (reduceMotion) {
        // Skip the pin entirely; show frame 0 statically.
        return;
      }

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=400%",
        scrub: 0.6,
        pin,
        /* pinSpacing: false — section height EQUALS pin distance,
           so when the pin completes the section ends at the same
           scroll position. No trailing gap. Same pattern as the
           hero pin. */
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        /* Snap settles the scrub onto whichever word's window is
           nearest after scroll input quiets. A fast flick still
           scrolls normally — snap only kicks in after `delay`. Net
           effect: each word fully assembles before the next can be
           triggered. Values mirror the word thresholds + 0 (pin
           start) and 1 (pin end). */
        snap: {
          snapTo: [0, WORD_THRESHOLD_1, WORD_THRESHOLD_2, 1],
          duration: { min: 0.2, max: 0.5 },
          delay: 0.12,
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
    { scope: sectionRef },
  );

  const activeFrame = FRAMES[wordIndex];

  return (
    <section
      ref={sectionRef}
      aria-label="The three principles, as one page-spread"
      className="relative isolate w-full overflow-hidden"
      style={{
        // Section height EQUALS pin distance (400vh) so the moment
        // the pin releases the section ends — Team is in viewport
        // with zero gap. Same pattern as the hero pin.
        height: "calc(var(--100vh, 100svh) * 4)",
        background: "var(--color-ink)",
      }}
    >
      {/* Pin element — viewport-filling stage, absolutely positioned
          at the top of the section. ScrollTrigger pins this; the
          section's explicit height equals the pin distance so the
          handoff to Team has no gap. */}
      <div
        ref={pinRef}
        className="absolute left-0 right-0 top-0 h-[100svh] w-full overflow-hidden"
      >
        {/* ── Layer 0: Atmospheric shader ───────────────────────
            Low-saturation MeshGradient that breathes behind the
            particles. Slower than the hero's shader so the motion
            reads as ambience, not animation. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[0]">
          <MeshGradient
            style={{ width: "100%", height: "100%" }}
            colors={[...TRIPTYCH_COLORS]}
            distortion={0.5}
            swirl={0.6}
            grainMixer={0.28}
            grainOverlay={0.14}
            speed={0.18}
            maxPixelCount={1_440_000}
          />
        </div>

        {/* ── Layer 1: Vignette ─────────────────────────────────
            Slight lavender bloom at centre (where the word lives)
            and ink darkening at corners. Frames the word
            cinematically and keeps the shader from competing for
            attention at the edges. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(ellipse 75% 60% at 50% 50%, rgba(189,112,246,0.10) 0%, rgba(14,10,30,0) 32%, rgba(14,10,30,0.45) 72%, rgba(6,4,15,0.85) 100%)",
          }}
        />

        {/* ── Layer 2: Particle word ────────────────────────────
            Single persistent canvas. The `text` prop change
            triggers the in-canvas scatter/reform morph — particles
            atomise, swirl outward, then re-form as the next word.
            Sits ABOVE the shader + vignette via z-index. */}
        <ImageParticleField
          className="absolute inset-0 z-[2]"
          text={activeFrame.word.toUpperCase()}
        />

        {/* Captions — one per frame, fade in/out as the active word
            changes. Inline opacity:0 on frames 1–2 keeps them hidden
            during the first paint before GSAP's set() runs. */}
        {FRAMES.map((frame, i) => (
          <div
            key={frame.word}
            ref={(el) => {
              captionRefs.current[i] = el;
            }}
            className={`pointer-events-none absolute inset-0 z-[3] flex flex-col gap-3 px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-24 xl:px-24 ${ALIGN_CLASSES[frame.align]}`}
            style={{ opacity: i === 0 ? 1 : 0 }}
          >
            <p className="editorial-label text-white/65">
              <span className="tabular-nums">№ 03 · {frame.index}</span>
              <span aria-hidden className="h-px w-8 bg-white/30" />
              <span>{frame.word}</span>
            </p>
            <p
              className="max-w-[34ch] italic text-white/85"
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
    </section>
  );
}
