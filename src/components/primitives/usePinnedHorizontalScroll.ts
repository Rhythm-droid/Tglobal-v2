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
  readonly refreshPriority: number;
  readonly mediaQuery?: string;
  readonly cardSelector?: string;
}

interface UsePinnedHorizontalScrollResult {
  readonly active: number;
  readonly onPillSelect: (index: number) => void;
}

const DEFAULT_MEDIA_QUERY = "(min-width: 1024px)";
const DEFAULT_CARD_SELECTOR = "[data-step-card]";

export function usePinnedHorizontalScroll({
  sectionRef,
  viewportRef,
  trackRef,
  mobileTrackRef,
  stepCount,
  settleRatio,
  refreshPriority,
  mediaQuery = DEFAULT_MEDIA_QUERY,
  cardSelector = DEFAULT_CARD_SELECTOR,
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

        const stopCount = Math.max(0, stepCount - 1);

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: viewport,
            refreshPriority,
            start: "top top",
            end: () => `+=${getDistance() / (1 - settleRatio)}`,
            pin: true,
            pinSpacing: true,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (stopCount === 0) {
                updateActive(0);
                return;
              }

              const cardProgress = Math.max(
                0,
                Math.min(
                  1,
                  (self.progress - settleRatio) / (1 - settleRatio),
                ),
              );
              const nextIndex = Math.min(
                stepCount - 1,
                Math.max(0, Math.round(cardProgress * stopCount)),
              );
              updateActive(nextIndex);
            },
          },
        });

        timeline.to({}, { duration: settleRatio });
        timeline.to(track, {
          x: () => -getDistance(),
          ease: "none",
          force3D: true,
          duration: 1 - settleRatio,
        });

        scrollTriggerRef.current = timeline.scrollTrigger ?? null;

        return () => {
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
        const timelineProgress =
          settleRatio + cardProgress * (1 - settleRatio);
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
