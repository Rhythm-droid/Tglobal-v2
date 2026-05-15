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
    title: "Speed is not a feature. It is an opinion about how teams learn.",
    body: "Every sprint we put something in your hands you can click, push on, and argue with. That is how we learn what is true about your product — by watching real reactions to real software, not by talking about hypotheses. Status decks are evidence we are not learning fast enough.",
    callout: "Demos teach. Decks reassure.",
  },
  {
    index: "02",
    title: "AI made code cheap. It did not make judgment cheap.",
    body: "Models scaffold. Tests write themselves. Documentation drafts on demand. None of that is the work. The work is choosing what to build, where to cut, and what to refuse — and that part still belongs to people who have shipped before.",
    callout: "Taste does not autocomplete.",
  },
  {
    index: "03",
    title: "Designed to be left.",
    body: "Your repo, your cloud account, your secrets, your runbooks — from the first commit on the first day. We build ourselves out of the picture so well that a competent in-house team could take over on a Monday morning. That is not a risk we tolerate. It is the goal.",
    callout: "The exit is the feature.",
  },
];

/* Entry-index thresholds. Tied to ScrollTrigger progress (0 → 1).
     • progress < ENTRY_0_AT → no entry showing yet (hero exit +
                                heading reveal + heading travel phase)
     • ENTRY_0_AT ≤ progress < ENTRY_1_AT → entry 0
     • ENTRY_1_AT ≤ progress < ENTRY_2_AT → entry 1
     • ENTRY_2_AT ≤ progress → entry 2
   ─────────────────────────────────────────────────────────────
   ALIGNMENT WITH TIMELINE PHASES
   ─────────────────────────────────────────────────────────────
   The GSAP timeline below has 6 phases over ~8.4 timeline units,
   mapped to scroll progress 0 → 1:
     Phase 1  t=0.0–1.0   hero copy dissolve
     Phase 2  t=1.0–1.9   manifesto heading reveal
     Phase 3  t=2.0–3.4   heading travel + eyebrow/subhead arrival
     Phase 4  t=3.4–4.1   right-rail slot fades IN
     Phase 5  t=4.1–7.5   slot fully visible (entry-display window)
     Phase 6  t=7.5–8.4   slot fades OUT + lavender exit wash
   The slot is only fully readable inside Phase 5 — t=[4.1, 7.5]
   maps to progress=[0.488, 0.893]. We split that 0.405-wide
   readable window into three equal sub-windows so each entry has
   identical visible scroll distance:
     entry 0   0.488 → 0.622  (visible, snap stop at 0.555)
     entry 1   0.622 → 0.758  (visible, snap stop at 0.690)
     entry 2   0.758 → 0.893  (visible, snap stop at 0.826)
   Below 0.488 the slot is still fading in (Phase 4) so no entry
   is mounted. Above 0.893 the exit wash is taking over (Phase 6)
   so the slot is fading out — at progress=1.0 the pin releases
   into Team. */
const ENTRY_0_AT = 0.488;
const ENTRY_1_AT = 0.622;
const ENTRY_2_AT = 0.758;

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

      /* Animations are unconditionally enabled — the previous
         reduced-motion early-return (which set every layer to
         opacity:1 and skipped the timeline) was removed when brand
         leadership chose animation-always over the accessibility
         trade-off. Users with `prefers-reduced-motion: reduce`
         still get the same pinned hero everyone else does. The CSS
         media block in globals.css that pins individual elements
         to opacity:1 is now a redundant safety net rather than the
         primary path — the GSAP timeline is the source of truth
         for visible state. */

      /* Measure delta from heading's resting layout slot (left-rail,
         vertically centred) to the centre of the pinned viewport.
         Re-measured on resize so the centre stays dead-centre.
         Only clear `transform` — opacity/filter don't affect layout
         measurement, and clearing them would briefly un-hide the
         heading mid-measurement (visible at higher browser zoom
         levels where layout reflows take more than one frame). */
      /* Centre-stage scale factor for Phase 2 (heading "punches out"
         at the viewport centre). Was a flat `1.5` which overshot the
         viewport on narrow phones — at 375px the heading text already
         renders at its mobile cap (24px clamp floor) AND its column
         spans nearly the full screen width minus padding. Scaling
         that by 1.5× pushed both edges of the line past the pin's
         overflow-hidden boundary so the text visibly clipped on
         iPhone SE / mini.
         Compute a scale that grows the heading toward the viewport
         width WITHOUT exceeding it: target ~92% of viewport (some
         breathing room at the edges) divided by the heading's
         natural rendered width. Capped at 1.5 on wide viewports
         (keeps the original punch-out feel on desktop) and floored
         at 1.0 so a heading that's already too wide doesn't get
         scaled DOWN (instead it stays at its measured size and the
         text-balance / break-words rules on the h2 handle wrapping). */
      const measureCentreOffset = () => {
        gsap.set(heading, { clearProps: "transform" });
        const rect = heading.getBoundingClientRect();
        const pinRect = pin.getBoundingClientRect();
        const headingCentreX = rect.left + rect.width / 2;
        const headingCentreY = rect.top + rect.height / 2;
        const viewportCentreX = window.innerWidth / 2;
        const viewportCentreY = pinRect.top + pin.offsetHeight / 2;
        const naturalWidth = rect.width;
        const targetWidth = window.innerWidth * 0.92;
        const fitScale = naturalWidth > 0 ? targetWidth / naturalWidth : 1.5;
        const centreScale = Math.max(1, Math.min(1.5, fitScale));
        return {
          dx: viewportCentreX - headingCentreX,
          dy: viewportCentreY - headingCentreY,
          centreScale,
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
         column width controls wrapping. `centreScale` is viewport-
         aware (see measureCentreOffset) so the text never overflows
         the pin on narrow phones. */
      gsap.set(heading, {
        x: offsets.dx,
        y: offsets.dy,
        scale: offsets.centreScale,
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
          /* Pin distance bumped from 480% → 680% so each manifesto
             entry has ~40% more scroll real-estate on screen. On a
             fast wheel-flick, entry 03 was cut off mid-scramble
             because the 03 band (0.758 → 1.0) only had ~96vh of
             scroll between snap stop and pin release. At 900% that
             band is ~216vh — plenty of dwell time for the slowest
             scramble (1.9s duration) to fully resolve even at fast
             wheel-flick speeds, AND extra space between entries so
             a quick scroll past one doesn't blast straight into
             the next. Each entry now owns ~1.2 viewports of
             vertical real estate vs ~0.9 at 680%. Must be kept in
             lockstep with the section's intrinsic height below
             (calc * 9) so the pin completes exactly when the
             section ends — no dead space below the pin. */
          end: "+=900%",
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
            /* Stops sit at the MIDPOINT of each entry's visible
               window inside Phase 5 of the timeline (see the
               ENTRY_*_AT comment above for the derivation).
                 0       pin top, hero copy fully visible
                 0.20    mid-intro — manifesto heading is materialising
                         but no entry is in the right rail yet. Acts
                         as a "soft landing" stop so a single wheel
                         tick from the very top doesn't fling the
                         user past the heading reveal straight into
                         entry 0's scramble.
                 0.555   entry 0 ("01 We compress…") fully read
                 0.690   entry 1 ("02 AI multiplies judgment.")
                 0.826   entry 2 ("03 Trust is built…")
                 1       pin exit, lavender wash complete
               directional:true tells ScrollTrigger to snap to the
               NEXT stop in the wheel's direction, not the geometric
               nearest. Without this a fast wheel-flick from p=0
               overshoots midway between two stops and resolves
               toward whichever is closer in raw distance — often
               leapfrogging an entry. With directional, each wheel
               tick advances exactly one stop forward or back. */
            snapTo: [0, 0.20, 0.555, 0.690, 0.826, 1],
            /* Slower snap settle so fast wheel-flicks have time to
               read the current entry before snapping past it. Was
               0.15-0.35s with delay 0.05 — too snappy, fast scrolls
               felt like the entries blurred by. 0.25-0.55s with
               delay 0.18 gives the eye ~0.7s after the user stops
               scrolling to register the entry, while still feeling
               responsive (not laggy). */
            duration: { min: 0.25, max: 0.55 },
            delay: 0.18,
            directional: true,
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

  /* The animated pinned-canvas hero runs for EVERY visitor, regardless
     of `prefers-reduced-motion`. This is a deliberate brand decision:
     animations are core to the site's identity, and we accept the
     accessibility trade-off rather than ship a static fallback that
     waters down the first impression. We still respect the perf
     budget per-device via lighter shader tiers (maxPixelCount cap,
     in-view IntersectionObserver pausing) so low-end phones don't
     burn cycles when the hero is off-screen — but the motion itself
     is non-negotiable.

     If accessibility compliance is ever required (gov contracts, EU
     EAA, ADA), the `AboutHeroStatic` sub-component below is kept in
     place as a ready-to-wire fallback — flip the gate back on by
     uncommenting the reduceMotion+mounted branch here. */

  return (
    <section
      ref={sectionRef}
      aria-labelledby="about-hero-heading"
      className="relative isolate w-full"
      /* Section height = pin distance (480vh) so when the pin
         completes the section ends precisely at that scroll
         position — Team section is now in viewport with zero gap.
         Section bg = the next section's colour (#ffffff for Team)
         so if anything peeks through, it's invisible. */
      style={{
        height: "calc(var(--100vh, 100svh) * 9)",
        background: "#ffffff",
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
              "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 26%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.4) 72%, rgba(255,255,255,0.85) 88%, rgba(255,255,255,1) 100%)",
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
              className="flex flex-wrap items-baseline justify-center gap-x-2 font-medium leading-[0.95] text-foreground sm:gap-x-3 lg:gap-x-4"
              style={{
                fontSize: "clamp(44px, 7vw, 132px)",
                letterSpacing: "-0.045em",
              }}
            >
              <span>We outrun</span>
              <span
                className="italic uppercase text-[#6b5ce7]"
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

            {/* SEO fallback — the RotatingWord component renders only
                the first word in the indexable DOM (the other 5
                cycle in client-side via setState, so Googlebot's
                renderer sees just "TIMELINES"). This visually-hidden
                span exposes every rotating word so the page can
                rank for "we outrun roadmaps", "we outrun backlogs",
                etc. Visible to crawlers and screen readers, hidden
                from sighted users. sr-only class via globals.css. */}
            <span className="sr-only">
              We outrun roadmaps, backlogs, sprints, quarters,
              deadlines, and timelines.
            </span>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:mt-12 lg:mt-14">
              <MagneticPill
                href="/#talk-to-us"
                variant="primary"
                cursorText="let's go"
              >
                Start a sprint <ArrowRight aria-hidden size={18} />
              </MagneticPill>
              {/* Was variant="ghost" (white-on-dark) when the hero
                  background was dark ink. The hero is now a light
                  lavender wash so ghost reads as invisible
                  white-on-light. variant="soft" is the matching
                  light-bg pill (lavender-tinted on lavender bg) and
                  was built for exactly this case. */}
              <MagneticPill
                href="/process"
                variant="soft"
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
          {/* Mobile vs desktop grid template:
                • Mobile (single column): `grid-rows-[1fr_1fr]` splits
                  the pin vertically into two equal halves. Each rail
                  centres its own content inside its half via
                  `justify-center`. Result: eyebrow/heading/subhead
                  sit centred in the TOP half, the entry rail sits
                  centred in the BOTTOM half — so the two content
                  blocks have equal vertical weight instead of the
                  left rail's content piling near the top and the
                  entry rail floating with huge dead space between
                  them. `gap-0` removes the additional gap because
                  the row-fr split already controls spacing.
                • Desktop (lg+): unchanged — `grid-cols-12` for the
                  editorial two-column read, `gap-14` for the column
                  gutter. The mobile row template is overridden by
                  `lg:grid-rows-none` so desktop uses its single
                  row + 12 cols. */}
          <div className="mx-auto grid h-full w-full max-w-[1440px] grid-cols-1 grid-rows-[1fr_1fr] gap-0 px-6 sm:px-8 lg:grid-cols-12 lg:grid-rows-none lg:gap-14 lg:px-14 xl:px-20">
            {/* Left rail — vertically centred stack. On mobile the
                two rails stack vertically and the right rail sits
                below this one, so we centre the content horizontally
                (items-center + text-center) to mirror the centred
                hero copy that just faded out. Above lg the rail
                returns to flush-left so the editorial column read
                holds. */}
            {/* Mobile padding tuning: `py-4` (was `py-16 sm:py-20`)
                because the parent grid now uses `grid-rows-[1fr_1fr]`
                so each rail has a guaranteed-equal half-viewport
                height; the previous padding was compensating for
                gap-12 row-spacing which we removed. lg:py-0 keeps
                desktop unchanged. */}
            <div className="flex h-full flex-col items-center justify-center py-4 text-center sm:py-6 lg:col-span-5 lg:items-start lg:py-0 lg:text-left">
              {/* Inline `opacity: 0` keeps the manifesto text hidden
                  from the FIRST paint — before useGSAP runs and sets
                  its own initial state. Without this, React commits
                  with default `opacity: 1`, the browser paints one
                  frame of the manifesto bleeding through the hero
                  copy, then GSAP catches up. At 100% zoom that
                  single-frame flash is invisible; at 125% / 150%
                  browser zoom the layout reflow takes long enough
                  that the flash becomes a persistent overlay until
                  GSAP catches up.

                  data-pin-on-reduced-motion is a CSS hook (see
                  globals.css). Under `prefers-reduced-motion: reduce`
                  the user's OS-level motion preference is honoured by
                  pinning these elements to opacity:1 at the CSS
                  layer — so the page is fully readable EVEN IF the
                  GSAP timeline never runs (e.g. Windows "Animation
                  effects" off, which suppresses the scroll-pinned
                  reveal). */}
              {/* justify-center on mobile centres the № 01 ─ THE
                  MANIFESTO row beneath the centred heading; lg+ keeps
                  it left-anchored for the editorial column. */}
              <p
                ref={eyebrowRef}
                data-pin-on-reduced-motion=""
                className="flex items-center justify-center gap-4 text-[11px] font-medium uppercase tracking-[0.22em] text-foreground-mid lg:justify-start"
                style={{
                  fontFamily:
                    "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
                  opacity: 0,
                }}
              >
                <span className="tabular-nums">№ 01</span>
                <span aria-hidden className="h-px w-8 bg-foreground-mid/40" />
                <span>The manifesto</span>
              </p>

              {/* Heading sizing + wrapping — permanent, breakpoint-aware.
                  ─────────────────────────────────────────────────────
                  Three things have to be true simultaneously for the
                  heading to render cleanly at every breakpoint:

                  1. The heading's CSS box must be NARROWER than its
                     column. We use max-w-[min(100%,_…)] so the cap
                     never exceeds the parent's available width AND
                     never invites layout to size the box past content.
                  2. Long single words ("compress", "distance",
                     "between", "working", "product") must individually
                     fit inside the box at the chosen font-size. At
                     mobile (24px) the widest word renders at ~105px;
                     at the worst-case 320px-viewport column (~272px
                     after padding) that's well under width.
                  3. The line-break algorithm must actually break. We
                     use text-pretty (greedy) below lg; Chrome's
                     text-balance on narrow viewports can silently fall
                     back to overflow when it can't find a balanced
                     solution, so it's reserved for lg+ where the
                     column is wide enough for balance to succeed.

                  break-words is a belt-and-braces safety net — if any
                  future copy edit introduces a longer word than the
                  column can fit, it breaks mid-word rather than
                  overflowing.

                  Font scale:
                    base  → 24px (fits 320px viewport with 24px padding)
                    sm+   → 28px
                    md+   → 32px
                    lg+   → clamp(36px, 4.4vw, 64px)
                  No more abrupt jumps — each step is ≤ 33% of the
                  previous, well inside what looks intentional. */}
              <h2
                ref={manifestoHeadingRef}
                data-pin-on-reduced-motion=""
                /* Three sentences, three lines. Each commitment
                   gets its own row so the rhythm reads as a
                   declaration ("Three commitments. / Every project.
                   / No exceptions.") rather than prose that wraps
                   awkwardly mid-clause. Left-aligned at every
                   viewport — matches the rail-style left edge of
                   the parent column. */
                className="mt-7 max-w-full break-words text-left text-[24px] font-medium leading-[1.1] text-foreground sm:text-[28px] md:text-[32px] lg:text-[clamp(36px,4.4vw,64px)]"
                style={{
                  letterSpacing: "-0.04em",
                  opacity: 0,
                }}
              >
                <span className="block">Three commitments.</span>
                <span className="block">Every project.</span>
                <span className="block">No exceptions.</span>
              </h2>

              <p
                ref={subheadRef}
                data-pin-on-reduced-motion=""
                style={{ opacity: 0 }}
                className="mx-auto mt-6 max-w-[44ch] text-base leading-[1.55] text-foreground-mid lg:mx-0 lg:text-lg"
              >
                They show up in how we scope, how we build, and how
                we leave. Read them once &mdash; and hold us to them.
              </p>
            </div>

            {/* Right rail — vertically-centred scramble entry slot.
                A fixed min-height guards against the surrounding
                layout lurching when the active entry's body changes
                length on swap.
                On mobile this rail sits BELOW the left rail (single
                column grid). Its content is centred so the index/
                title row, body paragraph, and italic callout all
                share a horizontal axis with the centred manifesto
                heading above. Above lg the rail returns to left-
                anchored for the editorial two-column read. */}
            <div className="flex h-full items-center py-4 sm:py-6 lg:col-span-7 lg:py-0 lg:pl-6 xl:pl-10 2xl:pl-14">
              <div
                ref={entrySlotRef}
                data-pin-on-reduced-motion=""
                className="w-full text-center lg:text-left"
                style={{ opacity: 0 }}
              >
                {activeEntry ? (
                  /* flex column + justify-center so the entire
                     entry block (index+title row, body, callout)
                     is vertically centred within the min-h slot.
                     Without this, the block anchored to the top
                     and a 1-line title like "Designed to be left."
                     left a large empty band below the callout,
                     making the slot read as bottom-loaded. */
                  <div className="flex min-h-[320px] flex-col justify-center sm:min-h-[340px]">
                    {/* justify-center on mobile centres the
                        "01  Speed is a product decision." row;
                        lg:justify-start returns it to the editorial
                        flush-left treatment. max-w paragraphs below
                        get mx-auto on mobile to centre their text
                        block (max-w only constrains width, not
                        position — mx-auto handles position). */}
                    {/* items-center handles BOTH 1-line and 2-line
                        titles automatically:
                          • 1-line title ("Designed to be left.") →
                            the giant index + the short title share
                            a midline so neither floats above/below.
                          • 2-line title ("Speed is not a feature. /
                            It is an opinion…") → the index sits in
                            the middle of the two-line block, which
                            reads as the right visual centre because
                            the index height (~0.85em) is roughly
                            equal to one title line.
                        Tuned by the line-heights below:
                          • Index leading-[0.85] keeps the digit's
                            line-box tight to its cap-height so the
                            visual centre lands where the glyph is.
                          • Title leading-[1.15] gives both lines
                            equal breathing — when wrapped to 2 lines
                            the block's midline aligns with the
                            single-line index's midline.
                        Result is layout that auto-adapts as content
                        changes line count, across every viewport.
                        On mobile the lg:justify-start drops to
                        justify-center so the whole row centres on
                        narrow screens. */}
                    <div className="flex items-center justify-center gap-5 sm:gap-7 lg:justify-start">
                      <span
                        className="shrink-0 text-[32px] font-medium tabular-nums leading-[0.85] text-foreground/30 sm:text-[40px] md:text-[48px] lg:text-[clamp(34px,4.6vw,72px)]"
                        style={{
                          letterSpacing: "-0.05em",
                        }}
                      >
                        <ScrambleSwap text={activeEntry.index} duration={700} />
                      </span>
                      <h3
                        className="break-words text-[20px] font-medium leading-[1.15] text-foreground sm:text-[22px] md:text-[24px] lg:text-[clamp(22px,2.6vw,38px)]"
                        style={{
                          letterSpacing: "-0.04em",
                        }}
                      >
                        <ScrambleSwap text={activeEntry.title} duration={1000} />
                      </h3>
                    </div>
                    <p className="mx-auto mt-5 max-w-[58ch] text-sm leading-[1.55] text-foreground-mid sm:text-base lg:mx-0 lg:text-[17px]">
                      <ScrambleSwap text={activeEntry.body} duration={900} />
                    </p>
                    <p
                      className="mt-4 italic text-foreground/85"
                      style={{
                        fontFamily:
                          "var(--font-instrument-serif), Georgia, serif",
                        fontSize: "clamp(16px, 1.5vw, 24px)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      &ldquo;
                      <ScrambleSwap text={activeEntry.callout} duration={800} />
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
            className="text-[10px] font-medium uppercase text-foreground-mid"
            style={{
              fontFamily:
                "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
              letterSpacing: "0.22em",
            }}
          >
            Scroll
          </span>
          <div className="relative h-14 w-px overflow-hidden bg-foreground-mid/25">
            <span className="scroll-cue-trail absolute left-0 top-0 block h-3 w-px bg-foreground/85" />
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
            background: "#ffffff",
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

/* ─────────────────────────────────────────────────────────────────
   AboutHeroStatic — flat fallback for reduced-motion users.
   ─────────────────────────────────────────────────────────────────
   No pin, no scrub, no overlapping layers. Renders as a series of
   normal-flow sections:
     1. Hero block — h1 + CTAs, centred, full-viewport tall
     2. Manifesto block — eyebrow + heading + lede, centred
     3. Three principle blocks — one per entry, each a stand-alone
        editorial card with index + title + body + callout
   All copy is the SAME as the animated version (same constants:
   MANIFESTO_ENTRIES, OUTRUN_TARGETS), so the messaging is identical
   regardless of which branch renders. The RotatingWord primitive
   keeps cycling words (its internal reduce-motion gate already
   pins to the first word for users who opt out, so this is a
   no-op for that primitive — it's left in for consistency).
   Background colour matches the animated version so the section
   below (Work Strip) lands on the same paper colour either way. */
/* eslint-disable-next-line @typescript-eslint/no-unused-vars --
   Intentionally retained as a dormant accessibility fallback. The
   comment block above (lines 528-531) documents how to re-wire it
   if reduced-motion compliance becomes required (gov contracts, EU
   EAA, ADA). Deleting it makes that pivot strictly harder. */
function AboutHeroStatic() {
  return (
    <section
      aria-labelledby="about-hero-heading"
      className="relative w-full"
      style={{ background: "#ffffff" }}
    >
      {/* Block 1 — Hero copy. Full-viewport-tall on first paint so the
          page still opens with the same "this is a hero" beat the
          animated version has. Below mobile the min height drops to
          fit short landscape phones without forcing internal scroll
          inside the block. */}
      <div className="flex min-h-[100svh] w-full items-center justify-center px-6 py-20 sm:px-8 lg:px-14 xl:px-20">
        <div className="mx-auto w-full max-w-[1440px] text-center">
          <h1
            id="about-hero-heading"
            className="flex flex-wrap items-baseline justify-center gap-x-2 font-medium leading-[0.95] text-foreground sm:gap-x-3 lg:gap-x-4"
            style={{
              fontSize: "clamp(44px, 7vw, 132px)",
              letterSpacing: "-0.045em",
            }}
          >
            <span>We outrun</span>
            <span
              className="italic uppercase text-[#6b5ce7]"
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
          <span className="sr-only">
            We outrun roadmaps, backlogs, sprints, quarters, deadlines, and timelines.
          </span>
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
              variant="soft"
              cursorText="explore"
            >
              See the process <Workflow aria-hidden size={18} />
            </MagneticPill>
          </div>
        </div>
      </div>

      {/* Block 2 — Manifesto heading + lede. Reuses the same eyebrow
          line, heading, and subhead from the animated version so the
          editorial voice is unchanged. Width matches the animated
          left rail (col-span-5 at lg = ~42% of 1440 ≈ 600px). */}
      <div className="w-full px-6 py-20 sm:px-8 sm:py-24 lg:px-14 lg:py-28 xl:px-20">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="mx-auto max-w-[640px] text-center lg:mx-0 lg:text-left">
            <p
              className="flex items-center justify-center gap-4 text-[11px] font-medium uppercase tracking-[0.22em] text-foreground-mid lg:justify-start"
              style={{
                fontFamily:
                  "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              <span className="tabular-nums">№ 01</span>
              <span aria-hidden className="h-px w-8 bg-foreground-mid/40" />
              <span>The manifesto</span>
            </p>
            <h2
              className="mt-7 max-w-full break-words text-pretty text-[24px] font-medium leading-[1.05] text-foreground sm:text-[28px] md:text-[32px] lg:text-balance lg:text-[clamp(36px,4.4vw,64px)]"
              style={{ letterSpacing: "-0.04em" }}
            >
              We compress the distance between an idea and a working product.
            </h2>
            <p className="mx-auto mt-6 max-w-[44ch] text-base leading-[1.55] text-foreground-mid lg:mx-0 lg:text-lg">
              They show up in how we scope, how we build, and how
              we leave. Read them once &mdash; and hold us to them.
            </p>
          </div>
        </div>
      </div>

      {/* Block 3 — Three principle entries stacked. Same copy + same
          ordering as the animated entry rail; presented as a list
          instead of a one-at-a-time scroll-driven swap. Hairline
          rules between entries match the editorial card pattern
          used in AboutTeam / AboutWorkStrip. */}
      <div className="w-full px-6 pb-24 sm:px-8 sm:pb-32 lg:px-14 lg:pb-40 xl:px-20">
        <div className="mx-auto w-full max-w-[1440px]">
          <ol className="mx-auto flex max-w-[860px] flex-col gap-12 sm:gap-16">
            {MANIFESTO_ENTRIES.map((entry) => (
              <li
                key={entry.index}
                className="border-t border-foreground/15 pt-8 sm:pt-10"
              >
                {/* items-center auto-adapts to title line count —
                    same approach as the animated rail above. See
                    that block's comment for the full rationale. */}
                <div className="flex items-center gap-5 sm:gap-7">
                  <span
                    className="shrink-0 text-[32px] font-medium tabular-nums leading-[0.85] text-foreground/30 sm:text-[40px] md:text-[48px] lg:text-[clamp(34px,4.6vw,72px)]"
                    style={{ letterSpacing: "-0.05em" }}
                  >
                    {entry.index}
                  </span>
                  <h3
                    className="break-words text-[20px] font-medium leading-[1.15] text-foreground sm:text-[22px] md:text-[24px] lg:text-[clamp(22px,2.6vw,38px)]"
                    style={{ letterSpacing: "-0.04em" }}
                  >
                    {entry.title}
                  </h3>
                </div>
                <p className="mt-5 max-w-[58ch] text-sm leading-[1.55] text-foreground-mid sm:text-base lg:text-[17px]">
                  {entry.body}
                </p>
                <p
                  className="mt-4 italic text-foreground/85"
                  style={{
                    fontFamily:
                      "var(--font-instrument-serif), Georgia, serif",
                    fontSize: "clamp(16px, 1.5vw, 24px)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  &ldquo;{entry.callout}&rdquo;
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
