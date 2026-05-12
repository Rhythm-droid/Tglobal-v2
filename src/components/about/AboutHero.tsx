"use client";

import { useRef, useState } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { MeshGradient } from "@paper-design/shaders-react";
import { ArrowRight, Workflow } from "lucide-react";

import MagneticPill from "@/components/primitives/MagneticPill";
import RotatingWord from "@/components/primitives/RotatingWord";
import ScrambleSwap from "@/components/primitives/ScrambleSwap";

import { HERO_COLORS } from "./palette";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/* AboutHero — single pinned stage on one continuous canvas.
   ─────────────────────────────────────────────────────────────
   Hero copy and the manifesto narrative live on a single pinned
   section so the background NEVER changes between them. Text
   layers swap on top of a constant shader+ink canvas.

   Layout split AFTER the hero exits:
     • LEFT rail  — eyebrow / heading / subhead, vertically centred.
     • RIGHT rail — one principle at a time (cycling via scramble),
                    vertically centred opposite the heading.
   The two rails are siblings in a 5/7 column grid; each rail uses
   `flex-col justify-center` so its content sits on the vertical
   midline of the viewport.

   Timeline (scrubbed against the pinned scroll range, +=480%):

     0.0 — 1.0  Hero copy fades + softens; scroll cue dims.
     1.0 — 1.9  Manifesto heading materialises AT VIEWPORT CENTRE,
                blur clears 18px → 0, opacity 0 → 1.
     2.0 — 3.2  Heading TRAVELS into its resting position in the
                left rail (vertically centred). Eyebrow above and
                subhead below fade up beside it.
     3.2 — 3.9  Right-rail entry slot fades in.
                Entry 0 (Speed) mounts; its ScrambleSwap children
                scramble in from random to target.
     3.9 — 6.0  Scroll drives currentEntryIndex through 0 → 1 → 2.
                Each threshold-cross hands a new `text` prop to the
                right-rail ScrambleSwap blocks; their letters
                jumble through random characters and resolve to
                the new entry's title / body / callout. The old
                text "explodes" into the new one — no slide, no
                fade, just letter alchemy.
     6.0 — 6.6  Quiet tail so the pin releases after entry 2 has
                settled and the reader has time to absorb it.

   Background continuity:
     The shader keeps painting through the entire pin. After the
     pin releases, a trailing gradient strip outside the pinned div
     fades ink → paper so the next light section enters gently.

   Entry rotation mechanics:
     A scrubbed timeline can't fire React state updates per frame
     cleanly. Instead, ScrollTrigger.onUpdate reads `self.progress`,
     maps it to an entry index, and only calls setState when the
     index actually crosses a threshold (guarded by a ref). The
     ScrambleSwap children then handle the text-replacement
     animation entirely on the rAF thread, independent of scroll.

   Reduced motion:
     Whole timeline is skipped — hero copy renders visible, the
     manifesto layer renders all-visible behind it, and the pin is
     also skipped so the user just scrolls past as a normal section. */

const OUTRUN_TARGETS = [
  "ROADMAPS",
  "BACKLOGS",
  "SPRINTS",
  "QUARTERS",
  "DEADLINES",
  "TIMELINES",
] as const;

interface ManifestoEntry {
  readonly index: string;
  readonly title: string;
  readonly body: string;
  readonly callout: string;
}

const MANIFESTO_ENTRIES: readonly ManifestoEntry[] = [
  {
    index: "01",
    title: "Speed is a product decision.",
    body: "We keep discovery short because a working build teaches more than a deck. The goal is not to look busy. The goal is to move the product forward every sprint, every week, with something the team can actually click.",
    callout: "Discovery is shipped, not held.",
  },
  {
    index: "02",
    title: "AI multiplies judgment.",
    body: "Agents do the boring parts: research, scaffolds, tests, docs. Humans still choose the shape, the taste, the tradeoffs, and the final bar before anything ships to your users.",
    callout: "Taste does not autocomplete.",
  },
  {
    index: "03",
    title: "Trust is built into the handoff.",
    body: "The codebase, the infra, and the runbooks are yours from the first commit. No lock-in, no mystery stack, no dependency disguised as partnership. If you bring it in-house tomorrow, it should be a Monday move, not a migration project.",
    callout: "Leaving stays easy.",
  },
];

/* Entry-index thresholds. Tied to ScrollTrigger progress (0 → 1).
     • progress < ENTRY_0_AT → no entry showing yet (hero exit +
                                heading reveal + heading travel phase)
     • ENTRY_0_AT ≤ progress < ENTRY_1_AT → entry 0
     • ENTRY_1_AT ≤ progress < ENTRY_2_AT → entry 1
     • ENTRY_2_AT ≤ progress → entry 2
   Tuned so each entry has roughly equal scroll real estate AND so
   entry 2 (the last one) gets EXTRA distance before the exit wash
   kicks in — its body has the longest scramble and we want it to
   resolve before the user reaches the next section, even at fast
   scroll speeds. */
const ENTRY_0_AT = 0.32;
const ENTRY_1_AT = 0.50;
const ENTRY_2_AT = 0.65;

function entryIndexFromProgress(p: number): number {
  if (p < ENTRY_0_AT) return -1;
  if (p < ENTRY_1_AT) return 0;
  if (p < ENTRY_2_AT) return 1;
  return 2;
}

export default function AboutHero() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  /* pinRef is the viewport-filling stage. ABSOLUTELY positioned
     inside the section (top:0, h-100svh) so the section's intrinsic
     flow height stays under our control (set via style on the
     section itself). ScrollTrigger pins this with pinSpacing: FALSE
     — no padding-bottom hack is added. The section's explicit
     height equals the pin distance, so the moment the pin completes,
     the section also ends and Work Strip is RIGHT THERE in viewport.
     No 100vh exit scroll, no hidden gap. */
  const pinRef = useRef<HTMLDivElement | null>(null);

  const heroCopyRef = useRef<HTMLDivElement | null>(null);
  const scrollCueRef = useRef<HTMLDivElement | null>(null);
  /* Exit-wash layer. Sits on top of everything inside the pin (z-5),
     starts invisible, fades to opaque lavender during the LAST beat
     of the timeline. The last visible frame of the pin matches the
     next section's colour exactly; when the pin completes the pin
     element is moved 480vh up the document (its absolute position
     within the section, which is now off-screen above), so the user
     sees Work Strip enter cleanly. */
  const exitWashRef = useRef<HTMLDivElement | null>(null);

  const eyebrowRef = useRef<HTMLParagraphElement | null>(null);
  const manifestoHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const subheadRef = useRef<HTMLParagraphElement | null>(null);
  const entrySlotRef = useRef<HTMLDivElement | null>(null);

  /* React state for which entry is active. Driven by ScrollTrigger
     onUpdate (read-only on the render side). Initial value -1 means
     the entry slot renders empty until the timeline reaches Phase 3. */
  const [entryIndex, setEntryIndex] = useState<number>(-1);
  /* Tracking ref so onUpdate only calls setState on threshold-cross,
     not every scroll frame. */
  const lastEntryIndexRef = useRef<number>(-1);

  useGSAP(
    () => {
      const heading = manifestoHeadingRef.current;
      const eyebrow = eyebrowRef.current;
      const subhead = subheadRef.current;
      const slot = entrySlotRef.current;
      const heroCopy = heroCopyRef.current;
      const scrollCue = scrollCueRef.current;
      const exitWash = exitWashRef.current;
      const pin = pinRef.current;
      const section = sectionRef.current;

      if (!heading || !heroCopy || !pin || !section || !eyebrow || !subhead || !slot)
        return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        gsap.set([heroCopy, heading, eyebrow, subhead, slot, scrollCue], {
          opacity: 1,
          clearProps: "transform,filter",
        });
        // Render entry 0 statically so the reader sees something.
        lastEntryIndexRef.current = 0;
        setEntryIndex(0);
        return;
      }

      /* Measure delta from heading's resting layout slot (left-rail,
         vertically centred) to the centre of the pinned viewport.
         Re-measured on resize so the centre stays dead-centre.
         Only clear `transform` — opacity/filter don't affect layout
         measurement, and clearing them would briefly un-hide the
         heading mid-measurement (visible at higher browser zoom
         levels where layout reflows take more than one frame). */
      const measureCentreOffset = () => {
        gsap.set(heading, { clearProps: "transform" });
        const rect = heading.getBoundingClientRect();
        const pinRect = pin.getBoundingClientRect();
        const headingCentreX = rect.left + rect.width / 2;
        const headingCentreY = rect.top + rect.height / 2;
        const viewportCentreX = window.innerWidth / 2;
        const viewportCentreY = pinRect.top + pin.offsetHeight / 2;
        return {
          dx: viewportCentreX - headingCentreX,
          dy: viewportCentreY - headingCentreY,
        };
      };

      const offsets = measureCentreOffset();

      // Initial visible state — hero copy and scroll cue showing.
      // `pointerEvents: auto` is explicit so the toggle in onUpdate
      // has a clean starting state to flip from.
      gsap.set(heroCopy, {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        pointerEvents: "auto",
        willChange: "transform, filter, opacity",
      });
      if (scrollCue) {
        gsap.set(scrollCue, { opacity: 1, willChange: "opacity" });
      }

      /* Heading starts at viewport CENTRE — pre-translated by the
         measured offset AND scaled up. The scale lets it punch out
         at headline scale while there's room (centre of the viewport,
         no column constraint), then the timeline rescales it back to
         1× as it travels into the narrow left rail where the natural
         column width controls wrapping. */
      gsap.set(heading, {
        x: offsets.dx,
        y: offsets.dy,
        scale: 1.5,
        opacity: 0,
        filter: "blur(18px)",
        transformOrigin: "center center",
        willChange: "transform, filter, opacity",
      });

      // Eyebrow + subhead start hidden, slightly below resting.
      gsap.set([eyebrow, subhead], {
        opacity: 0,
        y: 24,
        willChange: "transform, opacity",
      });

      // Right-rail entry slot — starts hidden until heading lands.
      gsap.set(slot, {
        opacity: 0,
        y: 32,
        willChange: "transform, opacity",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=480%",
          scrub: 0.6,
          pin,
          /* pinSpacing: false because the section's intrinsic height
             is set explicitly (style.height = "calc(100svh * 4.8)").
             That height EQUALS the pin distance, so the section ends
             precisely when the pin completes. GSAP's default padding
             trick is unnecessary and harmful here — it would add a
             second 100vh of dead space after the section. */
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          /* Snap settles the scrub onto whichever beat is nearest to
             the current progress AFTER the user stops scrolling. A
             fast flick still scrolls the page normally — the snap
             only kicks in once scroll input quiets for `delay`
             seconds, then animates progress to the nearest beat in
             `duration` seconds. The net effect: you can't accidentally
             land between entries with the manifesto half-rotated.
             snapTo values mirror the entry thresholds + the pin
             start (0) and exit-wash end (1). */
          snap: {
            snapTo: [0, ENTRY_0_AT, ENTRY_1_AT, ENTRY_2_AT, 1],
            duration: { min: 0.2, max: 0.5 },
            delay: 0.12,
            ease: "power2.inOut",
          },
          onUpdate: (self) => {
            /* Once the hero copy has visibly faded (~progress 0.15),
               disable its pointer events so the now-invisible CTAs
               beneath the manifesto cursor don't leak hover state
               (e.g. the "EXPLORE" pill firing while the user is
               actually pointing at a manifesto entry on the right
               rail above it in z-order). Re-enabled when scrolling
               back up past the threshold. */
            if (heroCopy) {
              heroCopy.style.pointerEvents =
                self.progress > 0.15 ? "none" : "auto";
            }
            const idx = entryIndexFromProgress(self.progress);
            if (idx !== lastEntryIndexRef.current) {
              lastEntryIndexRef.current = idx;
              setEntryIndex(idx);
            }
          },
        },
      });

      // Phase 1 — hero copy + scroll cue dissolve.
      tl.to(
        heroCopy,
        {
          opacity: 0,
          scale: 0.94,
          filter: "blur(8px)",
          duration: 1,
          ease: "power2.in",
        },
        0,
      );
      if (scrollCue) {
        tl.to(scrollCue, { opacity: 0, duration: 0.6 }, 0);
      }

      // Phase 2 — heading materialises at viewport centre.
      tl.to(
        heading,
        {
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "power2.out",
        },
        1.0,
      );

      // Phase 3 — heading TRAVELS into its left-rail slot.
      // (x, y) → (0, 0) lands it home; scale 1.5 → 1 brings it back
      // to natural column-fit size so it doesn't overflow the rail.
      // Eyebrow + subhead drift up into place alongside it.
      tl.to(
        heading,
        {
          x: 0,
          y: 0,
          scale: 1,
          duration: 1.3,
          ease: "power3.inOut",
        },
        2.0,
      );
      tl.to(
        [eyebrow, subhead],
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power2.out",
        },
        2.5,
      );

      // Phase 4 — right-rail entry slot fades in;
      // entry 0 will mount once progress crosses ENTRY_0_AT.
      tl.to(
        slot,
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
        },
        3.4,
      );

      // Phase 5 — hold for entry display.
      // Entry-to-entry SCRAMBLE animations are driven by setState →
      // ScrambleSwap, not by this timeline; this hold just keeps the
      // pin alive while the user scrolls through the entry-display
      // window. Length tuned so each entry has enough scroll distance
      // for its body scramble to resolve before the next entry is
      // triggered — and ESPECIALLY so entry 2 has comfortable room
      // before the exit phase blooms over it.
      tl.to({}, { duration: 3.4 }, "+=0");

      // Phase 6 — exit wash.
      // The manifesto layer fades out AND a full-bleed lavender wash
      // fades in to opaque, covering the shader. By the moment the
      // pin releases the user is looking at flat lavender (the next
      // section's exact colour) — so there's no "transition zone"
      // visible at all, the pin simply scrolls off and the marquee
      // scrolls in with no detectable boundary.
      const exitTargets = [eyebrow, heading, subhead, slot];
      tl.to(
        exitTargets,
        {
          opacity: 0,
          duration: 0.6,
          ease: "power2.in",
        },
        ">",
      );
      if (exitWash) {
        tl.to(
          exitWash,
          {
            opacity: 1,
            duration: 0.9,
            ease: "power2.inOut",
          },
          "<",
        );
      }

      const onResize = () => {
        const fresh = measureCentreOffset();
        gsap.set(heading, { x: fresh.dx, y: fresh.dy });
        ScrollTrigger.refresh();
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    },
    { scope: sectionRef },
  );

  const activeEntry = entryIndex >= 0 ? MANIFESTO_ENTRIES[entryIndex] : null;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="about-hero-heading"
      className="relative isolate w-full"
      /* Section height = pin distance (480vh) so when the pin
         completes the section ends precisely at that scroll
         position — Work Strip is in viewport with zero gap.
         Section bg = the next section's colour (lavender) so if
         anything peeks through, it's invisible. */
      style={{
        height: "calc(var(--100vh, 100svh) * 4.8)",
        background: "var(--color-paper-alt, #f4eef9)",
      }}
    >
      {/* Pin element — viewport-filling stage, ABSOLUTELY positioned
          inside the section at top:0, h-100svh. ScrollTrigger pins
          this (with pinSpacing: false). During pin: position becomes
          fixed at viewport top, filling viewport. After pin: returns
          to absolute at section top, which (with the user now
          scrolled 480vh in) is 480vh above viewport — i.e. off-
          screen above. Work Strip is at viewport top with no gap. */}
      <div
        ref={pinRef}
        className="absolute left-0 right-0 top-0 h-[100svh] w-full overflow-hidden"
      >
        {/* Always-on shader background. Speed stays constant — pausing
            it would break the "background never changes" promise. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[0]">
          <MeshGradient
            style={{ width: "100%", height: "100%" }}
            colors={[...HERO_COLORS]}
            distortion={0.6}
            swirl={0.45}
            grainMixer={0.32}
            grainOverlay={0.16}
            speed={0.32}
            maxPixelCount={1_440_000}
          />
        </div>

        {/* Vignette scrim — keeps the text layers legible regardless of
            where the shader wash currently sits. The bottom of the
            curve goes to 100% ink so the shader's purple variation
            completely fades to FLAT ink before the pin's bottom
            edge — that way the trailing gradient strip (which starts
            at flat ink) connects seamlessly with the same colour
            instead of butting up against shader variation. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(180deg, rgba(14,10,30,0.45) 0%, rgba(14,10,30,0) 26%, rgba(14,10,30,0) 50%, rgba(14,10,30,0.55) 72%, rgba(14,10,30,0.9) 88%, rgba(14,10,30,1) 100%)",
          }}
        />

        {/* ── Layer 3: Hero copy ──────────────────────────────────
            Fades out as the timeline opens; everything beneath then
            reveals into the centred slot it just vacated. */}
        <div
          ref={heroCopyRef}
          className="absolute inset-0 z-[3] flex items-center justify-center"
        >
          <div className="mx-auto w-full max-w-[1440px] px-6 text-center sm:px-8 lg:px-14 xl:px-20">
            <h1
              id="about-hero-heading"
              data-cursor="expand"
              className="flex flex-wrap items-baseline justify-center gap-x-2 font-medium leading-[0.95] text-white sm:gap-x-3 lg:gap-x-4"
              style={{
                fontSize: "clamp(44px, 7vw, 132px)",
                letterSpacing: "-0.045em",
              }}
            >
              <span>We outrun</span>
              <span
                className="italic uppercase text-[#c5baff]"
                style={{
                  fontFamily:
                    "var(--font-instrument-serif), Georgia, serif",
                  letterSpacing: "-0.04em",
                }}
              >
                <RotatingWord
                  words={OUTRUN_TARGETS}
                  interval={2200}
                  duration={0.55}
                />
              </span>
            </h1>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:mt-12 lg:mt-14">
              <MagneticPill
                href="/#talk-to-us"
                variant="primary"
                cursorText="let's go"
              >
                Start a sprint <ArrowRight aria-hidden size={18} />
              </MagneticPill>
              <MagneticPill
                href="/process"
                variant="ghost"
                cursorText="explore"
              >
                See the process <Workflow aria-hidden size={18} />
              </MagneticPill>
            </div>
          </div>
        </div>

        {/* ── Layer 4: Manifesto — two vertically-centred rails ───
            • LEFT rail (col-span-5)  → eyebrow / heading / subhead
              stacked, the stack vertically centred.
            • RIGHT rail (col-span-7) → one entry at a time, the
              block vertically centred opposite the heading. Active
              entry's text parts are wrapped in ScrambleSwap; when
              `entryIndex` changes, their letters jumble through
              random characters into the next entry's letters. */}
        <div className="absolute inset-0 z-[2]">
          <div className="mx-auto grid h-full w-full max-w-[1440px] grid-cols-1 gap-12 px-6 sm:px-8 lg:grid-cols-12 lg:gap-14 lg:px-14 xl:px-20">
            {/* Left rail — vertically centred stack */}
            <div className="flex h-full flex-col justify-center py-16 sm:py-20 lg:col-span-5 lg:py-0">
              {/* Inline `opacity: 0` keeps the manifesto text hidden
                  from the FIRST paint — before useGSAP runs and sets
                  its own initial state. Without this, React commits
                  with default `opacity: 1`, the browser paints one
                  frame of the manifesto bleeding through the hero
                  copy, then GSAP catches up. At 100% zoom that
                  single-frame flash is invisible; at 125% / 150%
                  browser zoom the layout reflow takes long enough
                  that the flash becomes a persistent overlay until
                  GSAP catches up. */}
              <p
                ref={eyebrowRef}
                className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.22em] text-white/55"
                style={{
                  fontFamily:
                    "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
                  opacity: 0,
                }}
              >
                <span className="tabular-nums">№ 01</span>
                <span aria-hidden className="h-px w-8 bg-white/30" />
                <span>The manifesto</span>
              </p>

              <h2
                ref={manifestoHeadingRef}
                className="mt-7 text-balance font-medium leading-[1.05] text-white"
                style={{
                  fontSize: "clamp(34px, 4.4vw, 64px)",
                  letterSpacing: "-0.04em",
                  opacity: 0,
                }}
              >
                We compress the distance between an idea and a working product.
              </h2>

              <p
                ref={subheadRef}
                style={{ opacity: 0 }}
                className="mt-6 max-w-[44ch] text-base leading-[1.55] text-white/65 lg:text-lg"
              >
                Three principles we keep on the wall. They drive every
                sprint, every code review, every conversation with you.
              </p>
            </div>

            {/* Right rail — vertically-centred scramble entry slot.
                A fixed min-height guards against the surrounding
                layout lurching when the active entry's body changes
                length on swap. */}
            <div className="flex h-full items-center py-16 sm:py-20 lg:col-span-7 lg:py-0">
              <div
                ref={entrySlotRef}
                className="w-full"
                style={{ opacity: 0 }}
              >
                {activeEntry ? (
                  <div className="min-h-[320px] sm:min-h-[340px]">
                    <div className="flex items-baseline gap-5 sm:gap-7">
                      <span
                        className="font-medium tabular-nums leading-none text-white/30"
                        style={{
                          fontSize: "clamp(34px, 4.6vw, 72px)",
                          letterSpacing: "-0.05em",
                        }}
                      >
                        <ScrambleSwap text={activeEntry.index} duration={1200} />
                      </span>
                      <h3
                        className="font-medium leading-[1.05] text-white"
                        style={{
                          fontSize: "clamp(22px, 2.6vw, 38px)",
                          letterSpacing: "-0.04em",
                        }}
                      >
                        <ScrambleSwap text={activeEntry.title} duration={1900} />
                      </h3>
                    </div>
                    <p className="mt-5 max-w-[58ch] text-sm leading-[1.55] text-white/72 sm:text-base lg:text-[17px]">
                      <ScrambleSwap text={activeEntry.body} duration={1800} />
                    </p>
                    <p
                      className="mt-4 italic text-white/85"
                      style={{
                        fontFamily:
                          "var(--font-instrument-serif), Georgia, serif",
                        fontSize: "clamp(16px, 1.5vw, 24px)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      &ldquo;
                      <ScrambleSwap text={activeEntry.callout} duration={1600} />
                      &rdquo;
                    </p>
                  </div>
                ) : (
                  /* Reserve the height while waiting for the first
                     entry so the surrounding layout doesn't reflow
                     when the entry slot first populates. */
                  <div
                    aria-hidden
                    className="min-h-[320px] sm:min-h-[340px]"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Layer 5: Scroll cue ─────────────────────────────────
            Fades with the hero copy on the same timeline cue. */}
        <div
          ref={scrollCueRef}
          aria-hidden
          className="pointer-events-none absolute bottom-8 left-1/2 z-[4] flex -translate-x-1/2 flex-col items-center gap-3 sm:bottom-10"
        >
          <span
            className="text-[10px] font-medium uppercase text-white/55"
            style={{
              fontFamily:
                "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
              letterSpacing: "0.22em",
            }}
          >
            Scroll
          </span>
          <div className="relative h-14 w-px overflow-hidden bg-white/15">
            <span className="scroll-cue-trail absolute left-0 top-0 block h-3 w-px bg-white/85" />
          </div>
        </div>

        {/* ── Layer 6: Exit wash ─────────────────────────────────
            Sits on top of every other layer inside the pin. Starts
            fully invisible; the timeline fades it to opaque lavender
            during the last beat of the scroll-pinned run. By the
            moment the pin releases, the entire pinned viewport is
            already painted with the next section's exact background
            colour — so the pin scrolls off into the marquee with no
            visible boundary at all. This IS the transition; no
            external gradient strip is needed below the pin. */}
        <div
          ref={exitWashRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[5]"
          style={{
            background: "var(--color-paper-alt, #f4eef9)",
            opacity: 0,
          }}
        />
      </div>

      {/* No trailing gradient strip needed. Section's intrinsic
          height equals the pin distance, so when the pin completes
          the section ends at the same scroll position — Work Strip
          is in viewport immediately. The exit-wash inside the pin
          paints lavender (the next section's colour) by the last
          frame of the timeline, so the visual handoff is the same
          colour on both sides of the boundary. */}
    </section>
  );
}
