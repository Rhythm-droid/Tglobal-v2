"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface HorizontalPinProps {
  children: ReactNode;
  /** Extra vertical scroll distance as a multiple of viewport height. Higher = slower horizontal travel. */
  scrub?: number | boolean;
  /** Optional id for the outer section (for anchor links). */
  id?: string;
  /** Optional className for the outer section. */
  className?: string;
  /** Optional className applied to the pinned viewport wrapper. */
  viewportClassName?: string;
  /** Optional className applied to the horizontally-translated track. */
  trackClassName?: string;
  /** Accessible label for the pinned region. */
  ariaLabel?: string;
}

/**
 * Classic GSAP horizontal-pin scroll.
 *
 * Usage:
 *   <HorizontalPin>
 *     <div className="flex gap-8 h-screen items-center px-[6vw]">
 *       ...cards / panels rendered in a flex row...
 *     </div>
 *   </HorizontalPin>
 *
 * The direct child of <HorizontalPin> is the horizontally-translated track.
 * Its intrinsic (unclipped) width drives the scroll distance.
 */
export default function HorizontalPin({
  children,
  scrub = 1,
  id,
  className = "",
  viewportClassName = "",
  trackClassName = "",
  ariaLabel,
}: HorizontalPinProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!viewport || !track) return;

      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      const getDistance = () =>
        Math.max(0, track.scrollWidth - viewport.clientWidth);

      const tween = gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: viewport,
          start: "top top",
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id={id}
      aria-label={ariaLabel}
      className={`relative ${className}`}
    >
      <div
        ref={viewportRef}
        className={`relative h-screen w-full overflow-hidden ${viewportClassName}`}
      >
        <div
          ref={trackRef}
          className={`flex h-full w-max will-change-transform ${trackClassName}`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
