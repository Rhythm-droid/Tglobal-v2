"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useLenis } from "@/components/primitives/SmoothScrollProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface UsePinnedHorizontalScrollOptions {
  readonly sectionRef: RefObject<HTMLElement | null>;
  readonly viewportRef: RefObject<HTMLDivElement | null>;
  readonly trackRef: RefObject<HTMLDivElement | null>;
  readonly mobileTrackRef: RefObject<HTMLDivElement | null>;
  readonly stepCount: number;
  readonly settleRatio: number;
  /**
   * Optional wrapper element around `viewportRef` that the hook will SIZE
   * dynamically (height = `pin_range * (1 − FADE_OUT_RATIO)`) so the
   * section's natural document extent absorbs the pin's scroll distance.
   *
   * Why this is needed:
   *   With `pinSpacing: false` the next section continues to scroll up
   *   behind the pinned viewport at its natural docY. That works only
   *   while `pin_range ≤ pinned_element_height`. If the pin is longer
   *   than the pinned element (e.g. wider cards → longer translate
   *   distance), the next section scrolls fully past behind the pin and
   *   is gone by the time the cross-fade reveals it.
   *
   *   Sizing this spacer to `pin_range * (1 − FADE_OUT_RATIO)` puts the
   *   next section at viewport top exactly when the cross-fade STARTS —
   *   so the user sees the next section materialise during the fade
   *   instead of an empty white reveal.
   *
   * Layout contract:
   *   - viewportRef must be the FIRST child of pinSpacerRef.
   *   - viewportRef should be h-screen (100vh) for a single-screen
   *     visible card area at the top of the spacer.
   *   - Anything else inside the spacer below viewportRef is treated as
   *     dead document space (scrolls past behind the fixed pin).
   */
  readonly pinSpacerRef?: RefObject<HTMLDivElement | null>;
  /**
   * GSAP `ScrollTrigger.refreshPriority`. **Higher number = refreshes EARLIER.**
   *
   * Why this matters with back-to-back pinned sections:
   *   When a pinned ScrollTrigger refreshes, it inserts a pin-spacer
   *   (`pinSpacing: true`, default) whose height equals the pin's scroll range
   *   (~`getDistance()/(1 - settleRatio)` for this hook). That spacer extends
   *   document height, which shifts the start position of every later
   *   ScrollTrigger by the spacer height.
   *
   *   If a later trigger refreshes BEFORE the earlier one, it caches its
   *   `start: "top top"` against the pre-spacer document. The earlier trigger
   *   then refreshes, inserts its spacer, and the later trigger's cached
   *   start is now stale by ~spacer-height pixels. Visible symptoms: the
   *   later pin engages prematurely (blank space above its content because
   *   its viewport pins at a scroll Y that's ~spacer-height before the
   *   actual section), and the handover from the earlier section feels
   *   like a snap/jump because two pinned `position: fixed` viewports
   *   briefly overlap.
   *
   *   Convention: assign DECREASING numbers in DOM order. With two pinned
   *   sections (HowItWorks, Services), HowItWorks must be > Services.
   *   Reference: https://gsap.com/resources/st-mistakes/ — "Creating
   *   ScrollTriggers out of order".
   */
  readonly refreshPriority: number;
  readonly mediaQuery?: string;
  readonly cardSelector?: string;
  /**
   * CSS selector for the NEXT section's pinned viewport that should fade
   * IN as this section fades OUT — a true cross-fade handover.
   *
   * Without this option the previous section is the only thing whose
   * opacity changes during the handover; the next section is already
   * fully opaque underneath, geometrically rising into view. Users
   * perceive that as "section pops in" once the dissolving section
   * reaches autoAlpha 0, because the rate of visible change is
   * monotonically increasing right up to the moment the previous
   * section disappears, then stops abruptly.
   *
   * Setting both endpoints of the dissolve — previous fading out AND
   * next fading in — distributes the visible change across the whole
   * fade window, so the perceived motion is continuous instead of
   * end-loaded.
   *
   * Implementation:
   *   - At timeline position 0 we `set(autoAlpha: 0)` on the target.
   *     Because the timeline is scrubbed, this state is held for the
   *     entire pre-fade portion of the pin (translate phase). The
   *     target is occluded by the current section anyway during that
   *     phase (current viewport at `position: fixed; top: 0` paints
   *     above), so users don't see the next section flash invisible.
   *   - During the fade window we tween autoAlpha 0 → 1 in parallel
   *     with the current section's 1 → 0 fade.
   *   - After pin release the target stays at 1 (timeline final state).
   *
   * If omitted, only the current section's fade-out plays — original
   * behaviour preserved.
   */
  readonly nextHandoverSelector?: string;
}

interface UsePinnedHorizontalScrollResult {
  readonly active: number;
  readonly onPillSelect: (index: number) => void;
}

const DEFAULT_MEDIA_QUERY = "(min-width: 1024px)";
const DEFAULT_CARD_SELECTOR = "[data-step-card]";

/**
 * Fraction of the pin timeline reserved for a scrub-driven cross-fade at
 * the END of each pin. Cards stay at their final translated position
 * while the entire pinned viewport's `autoAlpha` (opacity + visibility)
 * tweens 1 → 0. The next section, in flow underneath the fading
 * viewport, becomes progressively visible THROUGH the fade.
 *
 * Why fade instead of slide-up (we tried both):
 *   A pure `yPercent: -100` slide-up produces a visible "gap" mid-
 *   transition: the user sees the upper half of the screen sliding up
 *   off-viewport while the lower half shows the next section rising —
 *   between them is the section's white background, which reads as
 *   broken empty space rather than a smooth handover. A cross-fade
 *   keeps the dissolving viewport in place at decreasing opacity, so
 *   the user perceives a continuous dissolve rather than a structural
 *   gap. The tradeoff is photometric ghosting at mid-fade (the
 *   dissolving section is faintly visible on top of the next one),
 *   which we minimise via the `expo.in` ease in Phase 3 — opacity
 *   stays above 0.95 through ~75% of the fade range, then drops
 *   sharply, so the visible-overlap window is roughly the last 35 px
 *   of scroll instead of all 140 px.
 *
 * Why 0.25 specifically (was 0.15):
 *   - At settleRatio 0.20, this leaves translateRatio = 0.55. Pin range
 *     = distance / 0.55 ≈ 1.82×distance. The fade window thus occupies
 *     0.25 × 1.82 = 0.455 of the cards' total horizontal travel in
 *     scroll pixels — roughly 260–320 px of vertical scroll on a 900 px
 *     viewport. That's enough scroll distance that even a fast wheel
 *     flick (≈1500 px/s) takes >170 ms to traverse the fade — well into
 *     "perceived as motion" territory rather than "perceived as flash".
 *   - 0.15 (the previous value) gave only ~140 px of fade scroll; team
 *     and stakeholder feedback flagged that as still snappy at zoom
 *     levels where each scroll pixel maps to fewer visual pixels,
 *     compressing the fade into one or two animation frames.
 *   - Trade-off: each pinned section's docY span grows by ~18% relative
 *     to the 0.15 ratio (pinRange grew from distance/0.65 to
 *     distance/0.55). Across HowItWorks + Services that adds roughly
 *     400–500 px to total document height — acceptable for the smoother
 *     handover.
 *
 * Backward scroll: GSAP reverses the timeline, so the fade auto-plays
 * backward as the user scrolls back UP into the pin range — no manual
 * onEnterBack/onLeaveBack reset logic needed.
 */
const FADE_OUT_RATIO = 0.25;

export function usePinnedHorizontalScroll({
  sectionRef,
  viewportRef,
  trackRef,
  mobileTrackRef,
  stepCount,
  settleRatio,
  refreshPriority,
  pinSpacerRef,
  mediaQuery = DEFAULT_MEDIA_QUERY,
  cardSelector = DEFAULT_CARD_SELECTOR,
  nextHandoverSelector,
}: UsePinnedHorizontalScrollOptions): UsePinnedHorizontalScrollResult {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const lastActiveRef = useRef(0);
  const [active, setActive] = useState(0);
  const lenis = useLenis();

  const updateActive = useCallback((index: number) => {
    if (index !== lastActiveRef.current) {
      lastActiveRef.current = index;
      setActive(index);
    }
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(mediaQuery, () => {
        const viewport = viewportRef.current;
        const track = trackRef.current;
        if (!viewport || !track) return;

        const getDistance = () => {
          const wrapper = track.parentElement;
          if (!wrapper) return 0;
          return Math.max(0, track.scrollWidth - wrapper.clientWidth);
        };

        /* Dynamic pin-spacer sizing.
           ───────────────────────────
           When a `pinSpacerRef` is provided, set its height to the full
           pin range. The next section is in flow directly after this
           spacer, so its docY top edge equals `pinSpacer.top + spacerH`.
           With spacer height = pinRange, the next section's docY top
           lands at exactly the scroll position where this pin releases —
           so when the slide-up completes (Phase 3), the next section is
           geometrically already at viewport top. No empty white reveal,
           no ghost overlap.
           Recomputed on every ScrollTrigger.refresh because viewport
           width changes shift `getDistance()` and thus the pin range. */
        const updateSpacerHeight = () => {
          const spacer = pinSpacerRef?.current;
          if (!spacer) return;
          const distance = getDistance();
          const translateRatio = 1 - settleRatio - FADE_OUT_RATIO;
          if (translateRatio <= 0 || distance <= 0) {
            spacer.style.height = "";
            return;
          }
          const pinRange = distance / translateRatio;
          spacer.style.height = `${Math.ceil(pinRange)}px`;
        };
        updateSpacerHeight();
        ScrollTrigger.addEventListener("refreshInit", updateSpacerHeight);

        const stopCount = Math.max(0, stepCount - 1);

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: viewport,
            refreshPriority,
            start: "top top",
            /* Pin range = getDistance() / translateRatio so cards translate
               1:1 with scroll during the translate phase. With both a
               settle-in beat and a fade-out beat reserving timeline ends,
               the translate phase is the middle (1 − settleRatio − fadeOut)
               of the timeline. Solving for pin_range:
                   cards travel `getDistance()` during translate phase
                   translate phase scroll = pin_range * translateRatio
                   ⇒ pin_range = getDistance() / translateRatio
               Without this scaling, adding the fade-out tween would shrink
               the per-pixel card velocity and break the 1:1 scroll feel. */
            end: () =>
              `+=${getDistance() / (1 - settleRatio - FADE_OUT_RATIO)}`,
            pin: true,
            /* Force position:fixed pinning instead of transform pinning.
               ─────────────────────────────────────────────────────────
               Why explicit `pinType: "fixed"` is required here:
                 ScrollTrigger's default for window-scroller pins IS
                 "fixed", but it auto-switches to "transform" whenever it
                 detects a transformed/will-change ancestor (since
                 position:fixed gets clipped by transformed parents). In
                 dev, framer-motion / Next.js / Lenis can introduce
                 transient transform contexts during HMR or initial
                 hydration, which causes the auto-detection to lock in
                 "transform" mode for these pins.
                 With pinType:"transform" the element stays `position:
                 relative` and a translateY is applied to keep it visually
                 fixed. That keeps it in document flow at the same DOM
                 stacking level as the next section. With pinSpacing:false
                 (no padding reservation), the next section continues to
                 scroll up at its natural docY — and because both are
                 position:relative siblings, the LATER section in DOM
                 order paints on top. Symptom: at mid-HowItWorks-pin you
                 could see Services bleeding over the bottom half of the
                 viewport.
                 Forcing `pinType: "fixed"` puts the pinned element into
                 its own viewport stacking context, which paints above
                 in-flow siblings. Combined with the opaque bg-white on
                 the viewport, this fully occludes the next section while
                 it scrolls up underneath. */
            pinType: "fixed",
            /* Bring the active pin to the top of the stacking order.
               ─────────────────────────────────────────────────────
               Even with `pinType: "fixed"`, ScrollTrigger applies an
               identity transform (`matrix(1,0,0,1,0,0)`) to every pinned
               element to set up GPU-accelerated rendering. Per CSS spec,
               any non-`none` transform creates a new stacking context,
               so each pinned section becomes its own stacking layer
               sibling to the other pinned sections. When two siblings
               have stacking contexts at the same level and identical
               z-index (auto), the LATER one in DOM order paints on top
               of the earlier one.
               In our two-pin layout (HowItWorks earlier, Services later),
               that meant Services painted over HowItWorks during the
               HowItWorks pin range — the user saw Services bleeding
               into the bottom half of the viewport while HowItWorks was
               supposed to be locked to the viewport top.
               Fix: when the pin engages (or re-engages on scroll-back),
               set z-index high so the active pin always wins the
               stacking battle. Reset on release so the inactive section
               doesn't keep covering its successor during the transition
               zone — that 140-px handover is supposed to show the next
               section rising up, with the previous section's tail
               visible above.
               Reference: gsap.com/community/forums/topic/26570 — GSAP
               eventually fixed pin-spacer to copy z-index from the
               pinned element. We set it directly on the pinned element
               via callback so this works regardless of GSAP version. */
            onToggle: (self) => {
              const el = self.pin as HTMLElement | null;
              if (el) el.style.zIndex = self.isActive ? "20" : "";
            },
            /* Why pinSpacing: false (not the default true):
               ─────────────────────────────────────────────
               With pinSpacing: true ScrollTrigger inserts a `pin-spacer`
               wrapper around the pinned element with padding-bottom equal
               to the pin range (~760–810 px here). That padding reserves
               scroll budget so the next section "catches up" only after
               the user has scrolled past the entire reserved range. The
               problem: that reserved range is empty white space — the
               user perceives it as a void after the pin releases ("scroll
               another half-screen of nothing before the next section
               appears"). Symptom #1: visible gap after HowItWorks's last
               card. Symptom #2: visible gap after Services's last card.

               With pinSpacing: false there's no spacer. The pinned
               element gets `position: fixed` directly during pin, then
               returns to its natural in-flow position when the pin
               releases. Subsequent sections continue scrolling at their
               natural document positions — they "rise up" behind the
               pinned element during the pin (occluded by the viewport's
               opaque bg-white) and are already in place when pin releases.
               The handover from one pinned section to the next is
               continuous: no reserved-padding gap.

               Requirements that this configuration depends on:
                 • Pinned element must paint an opaque background so it
                   visually occludes content scrolling up behind it during
                   pin. Both HowItWorks's and Services's `viewportRef`
                   already carry `bg-white`. Removing that bg would expose
                   the next section bleeding through during pin.
                 • Pin range must not exceed element height + the natural
                   gap to the next section. Otherwise the next section
                   would scroll into viewport while the current pin is
                   still active, producing visible double-rendering. With
                   `h-screen` (100vh) viewports and a pin range of
                   `getDistance() / (1 - settleRatio)`, this holds for the
                   current card counts; any future expansion of card
                   travel needs to re-check.
                 • matchMedia teardown returns the element to its natural
                   position. Since pinSpacing: false didn't insert a
                   spacer, there's nothing to unwrap on cleanup — safer
                   than pinSpacing: true under HMR/route-change churn.

               Reference: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
                          and forum threads 37382, 43800 on overlapping
                          pinned sections. */
            pinSpacing: false,
            scrub: true,
            invalidateOnRefresh: true,
            /* Reduces a perceptible 1-frame delay when the pin engages on
               fast wheel/trackpad flicks — ScrollTrigger watches scroll
               velocity and applies the pin a hair earlier so the user
               doesn't see the section "tear" past the lock-in point.
               Has no effect at slow scroll speeds (the priority fix above
               handles those); strictly defensive against fast scrolls. */
            anticipatePin: 1,
            onUpdate: (self) => {
              if (stopCount === 0) {
                updateActive(0);
                return;
              }

              /* Pill index tracks the TRANSLATE phase only. Settle-in keeps
                 the user on pill 0; fade-out keeps the user on the final
                 pill — the cards aren't moving in either beat, so the
                 pill shouldn't move either. */
              const translateRatio = 1 - settleRatio - FADE_OUT_RATIO;
              const cardProgress = Math.max(
                0,
                Math.min(1, (self.progress - settleRatio) / translateRatio),
              );
              const nextIndex = Math.min(
                stepCount - 1,
                Math.max(0, Math.round(cardProgress * stopCount)),
              );
              updateActive(nextIndex);
            },
          },
        });

        const translateRatio = 1 - settleRatio - FADE_OUT_RATIO;

        /* Phase 1: settle-in — cards stationary while pin engages. */
        timeline.to({}, { duration: settleRatio });

        /* Phase 2: translate — cards scrub horizontally 1:1 with scroll. */
        timeline.to(track, {
          x: () => -getDistance(),
          ease: "none",
          force3D: true,
          duration: translateRatio,
        });

        /* Phase 3: cross-fade — current viewport fades OUT while the
           next section's pinned viewport fades IN over the same scroll
           window. Both endpoints of the dissolve animate, so the rate
           of visible change is distributed across the entire fade
           window instead of end-loaded.

           Why a true cross-fade (was: previous-only fade):
             With only the dissolving section animating, the next
             section sits at autoAlpha 1 underneath, geometrically
             rising into view. Users perceive that as "next section
             pops in" once the dissolving section reaches 0, because
             nothing about the next section is changing — only its
             reveal-by-occlusion. Adding a 0→1 tween on the next
             section gives the user a second motion cue (the next
             section materialising) that runs synchronously with the
             first (the previous dissolving), so both halves of the
             handover read as motion.

           Why `none` (linear) for both halves:
             For a true cross-fade, the smoothest perceptual result is
             when the two opacities sum to exactly 1.0 throughout the
             dissolve — no moment where total visible weight spikes
             above 1 (over-bright/double-exposed) or dips below 1
             (under-bright/dim flash). Only linear ease pairs achieve
             this: out_opacity = 1 − p, in_opacity = p, sum = 1 always.
             Curved eases like power2.in/power2.out cross at p≈0.5 with
             out=0.75 and in=0.75, summing to 1.5 — visibly heavier in
             the middle and noticed as a "ghosty" overlap.
             Linear has a slight mechanical feel in isolation, but
             paired with the geometric translate-in (Services rising
             from below at full opacity weight) and the natural inertia
             of Lenis-smoothed scroll, the user reads it as continuous
             motion, not as a constant-velocity ramp.

           autoAlpha (opacity + visibility) auto-flips visibility:hidden
           at opacity 0 so the faded-out viewport stops capturing
           pointer events. GSAP auto-reverses this on backward scroll. */
        const fadePosition = settleRatio + translateRatio;

        timeline.to(
          viewport,
          {
            autoAlpha: 0,
            ease: "none",
            duration: FADE_OUT_RATIO,
          },
          fadePosition,
        );

        if (nextHandoverSelector) {
          /* Look up at timeline-build time. matchMedia callback runs
             after both sections have mounted on lg breakpoints, so the
             query is reliable. If the selector resolves to nothing we
             silently skip — the cross-fade is a progressive
             enhancement, not a correctness requirement. */
          const nextEl = document.querySelector<HTMLElement>(nextHandoverSelector);
          if (nextEl) {
            /* Hold the next section invisible from timeline start. With
               scrub, this state is held throughout settle-in + translate
               and the target only animates during the fade window. */
            timeline.set(nextEl, { autoAlpha: 0 }, 0);
            timeline.to(
              nextEl,
              {
                autoAlpha: 1,
                ease: "none",
                duration: FADE_OUT_RATIO,
              },
              fadePosition,
            );
          }
        }

        scrollTriggerRef.current = timeline.scrollTrigger ?? null;

        return () => {
          ScrollTrigger.removeEventListener("refreshInit", updateSpacerHeight);
          const spacer = pinSpacerRef?.current;
          if (spacer) spacer.style.height = "";
          timeline.scrollTrigger?.kill();
          timeline.kill();
          scrollTriggerRef.current = null;
        };
      });

      return () => mm.kill();
    },
    {
      scope: sectionRef,
      dependencies: [
        mediaQuery,
        pinSpacerRef,
        refreshPriority,
        sectionRef,
        settleRatio,
        stepCount,
        trackRef,
        updateActive,
        viewportRef,
      ],
    },
  );

  useEffect(() => {
    const track = mobileTrackRef.current;
    if (!track) return;

    const stopCount = Math.max(0, stepCount - 1);

    const syncActiveFromScroll = () => {
      const max = track.scrollWidth - track.clientWidth;

      if (max <= 0 || stopCount === 0) {
        updateActive(0);
        return;
      }

      const progress = track.scrollLeft / max;
      const nextIndex = Math.min(
        stepCount - 1,
        Math.max(0, Math.round(progress * stopCount)),
      );
      updateActive(nextIndex);
    };

    syncActiveFromScroll();
    track.addEventListener("scroll", syncActiveFromScroll, { passive: true });
    return () =>
      track.removeEventListener("scroll", syncActiveFromScroll);
  }, [mobileTrackRef, stepCount, updateActive]);

  const onPillSelect = useCallback(
    (index: number) => {
      const maxIndex = Math.max(0, stepCount - 1);
      const targetIndex = Math.min(maxIndex, Math.max(0, index));
      const scrollTrigger = scrollTriggerRef.current;

      if (scrollTrigger) {
        const stopCount = Math.max(1, maxIndex);
        const cardProgress =
          maxIndex === 0 ? 0 : targetIndex / stopCount;
        /* Map pill click to the TRANSLATE phase of the timeline. The
           translate phase sits between the settle-in beat and the fade-out
           beat: progress ∈ [settleRatio, 1 − FADE_OUT_RATIO]. Without this
           remapping, clicking the last pill would scroll to the END of the
           timeline (= fully faded out viewport), leaving the user looking
           at the next section instead of the last card. */
        const translateRatio = 1 - settleRatio - FADE_OUT_RATIO;
        const timelineProgress = settleRatio + cardProgress * translateRatio;
        const rawTargetY =
          scrollTrigger.start +
          timelineProgress * (scrollTrigger.end - scrollTrigger.start);
        const minTargetY = scrollTrigger.start + 1;
        const maxTargetY = scrollTrigger.end - 1;
        const targetY =
          maxTargetY <= minTargetY
            ? rawTargetY
            : Math.max(minTargetY, Math.min(maxTargetY, rawTargetY));

        if (lenis) {
          lenis.scrollTo(targetY, { duration: 0.6, lock: true });
        } else {
          window.scrollTo({ top: targetY, behavior: "smooth" });
        }
        return;
      }

      const track = mobileTrackRef.current;
      if (!track) return;

      const cards = track.querySelectorAll<HTMLElement>(cardSelector);
      const card = cards[targetIndex];
      if (card) {
        track.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
      }
    },
    [cardSelector, lenis, mobileTrackRef, settleRatio, stepCount],
  );

  return { active, onPillSelect };
}
