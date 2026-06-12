"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface WorkMarqueeProps {
  /** Tokens to display in the marquee — interspersed with a separator. */
  items: readonly string[];
  /** Optional className for the wrapping section. */
  className?: string;
  /** Base loop duration (seconds) for the front row. Larger = slower.
      The back row derives a 0.85× duration so the two rows weave at a
      1 : 0.85 ratio (a deliberate, non-synchronised cadence). */
  speed?: number;
  /** Variant — "ink" sits on dark surfaces, "paper" on light. */
  variant?: "ink" | "paper";
}

/* Soft edge-fade so tokens flow IN and OUT of view rather than hard-
   cutting at the viewport edges. CSS mask-image (alpha) — renders
   identically in Gecko and Blink (no filter:blur, no stop-opacity
   luminance-mask trap). */
const EDGE_MASK =
  "linear-gradient(90deg, transparent 0%, #000 7%, #000 93%, transparent 100%)";
/* Brand easing, used for the separator hover micro-interaction. */
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * WorkMarquee — kinetic typography divider between case studies and the
 * Playbook section. "Dual-strip scissor" redesign:
 *
 *   • TWO rows. Front row scrolls left (xPercent 0→-50, `speed`s); back
 *     row scrolls right (xPercent -50→0, 0.85×speed), at 75% opacity +
 *     0.9 scale so it reads as a layer behind the front row. The two
 *     rows weave past each other.
 *   • SCROLL VELOCITY shears the two rows in OPPOSITE directions (a
 *     scissor), and nudges each row's timeScale in its own travel
 *     direction, then eases back — the strip reacts to the reader's
 *     energy without ever becoming unreadable.
 *   • The Instrument-Serif "·" separators are reading cues: on a
 *     pointer device, hovering a token scales + brightens its separator.
 *   • Soft edge-masks fade tokens at both viewport edges.
 *
 * Correctness / edge cases (all handled below):
 *   • prefers-reduced-motion → no loops, no velocity skew; both rows
 *     render as a static, fully-readable frame (identical at rest).
 *   • Off-screen → base loops pause (IntersectionObserver); tab hidden
 *     → loops pause (Page Visibility API). Both resume only when in
 *     view AND visible AND motion allowed — no wasted CPU/battery.
 *   • SSR-safe: no JSX branches on motion state; GSAP runs client-only
 *     via useGSAP. aria-hidden (decorative). GSAP context auto-cleans
 *     on unmount (useGSAP scope) and ScrollTrigger is killed on unmount.
 *   • Resize-safe: xPercent is dimension-relative, no pixel math.
 */
export default function WorkMarquee({
  items,
  className = "",
  speed = 36,
  variant = "ink",
}: WorkMarqueeProps) {
  const wrapperRef = useRef<HTMLElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const frontTween = useRef<gsap.core.Tween | null>(null);
  const backTween = useRef<gsap.core.Tween | null>(null);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  /* ── Base loops ─────────────────────────────────────────────────
     Each track is rendered twice end-to-end. Front: 0→-50 (moves
     left). Back: -50→0 (moves right). Half-width travel = seamless. */
  useGSAP(
    () => {
      if (prefersReduced) return;
      const front = frontRef.current;
      const back = backRef.current;
      if (!front || !back) return;

      frontTween.current = gsap.fromTo(
        front,
        { xPercent: 0 },
        { xPercent: -50, duration: speed, ease: "none", repeat: -1 },
      );
      backTween.current = gsap.fromTo(
        back,
        { xPercent: -50 },
        { xPercent: 0, duration: speed * 0.85, ease: "none", repeat: -1 },
      );

      return () => {
        frontTween.current?.kill();
        backTween.current?.kill();
        frontTween.current = null;
        backTween.current = null;
      };
    },
    { scope: wrapperRef, dependencies: [speed] },
  );

  /* ── Velocity scissor (skew opposite per row + gentle timeScale
        nudge in each row's travel direction) ──────────────────────── */
  useEffect(() => {
    if (prefersReduced) return;
    const front = frontRef.current;
    const back = backRef.current;
    if (!front || !back) return;

    const trigger = ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: "top bottom",
      end: "bottom top",
      onUpdate(self) {
        const v = gsap.utils.clamp(-2.5, 2.5, self.getVelocity() / 1000);
        // Opposite skew = scissor shear between the two rows.
        gsap.to(front, { skewX: v * 1.6, duration: 0.5, ease: "power3.out", overwrite: "auto" });
        gsap.to(back, { skewX: v * -1.6, duration: 0.5, ease: "power3.out", overwrite: "auto" });
        // Front travels left → speeds up on downward scroll; back travels
        // right → speeds up on upward scroll. Subtle (≤ +0.5×).
        if (frontTween.current) {
          gsap.to(frontTween.current, { timeScale: 1 + gsap.utils.clamp(0, 0.5, v * 0.4), duration: 0.4, ease: "power2.out", overwrite: "auto" });
        }
        if (backTween.current) {
          gsap.to(backTween.current, { timeScale: 1 + gsap.utils.clamp(0, 0.5, -v * 0.4), duration: 0.4, ease: "power2.out", overwrite: "auto" });
        }
      },
    });
    return () => trigger.kill();
  }, [prefersReduced]);

  /* ── Pause when off-screen OR tab hidden ────────────────────────
     A continuously-looping marquee burns GPU/battery even when not
     visible. Pause both base tweens unless the strip is on-screen AND
     the tab is foregrounded. Reconciled from two signals. */
  useEffect(() => {
    if (prefersReduced) return;
    const el = wrapperRef.current;
    if (!el) return;

    let inView = true;
    let visible = !document.hidden;
    const reconcile = () => {
      const play = inView && visible;
      frontTween.current?.[play ? "play" : "pause"]();
      backTween.current?.[play ? "play" : "pause"]();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        reconcile();
      },
      { rootMargin: "100px 0px" },
    );
    io.observe(el);

    const onVisibility = () => {
      visible = !document.hidden;
      reconcile();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [prefersReduced]);

  const surface =
    variant === "ink"
      ? "bg-foreground text-background border-y border-background/10"
      : "bg-background text-foreground border-y border-border";

  /* One row of tokens, rendered twice for a seamless wrap. `scale` and
     `dimOpacity` differentiate the back row's depth. */
  const renderRow = (
    ref: React.RefObject<HTMLDivElement | null>,
    scaleClass: string,
    dimOpacity: number,
  ) => (
    <div
      className="overflow-hidden"
      style={{ WebkitMaskImage: EDGE_MASK, maskImage: EDGE_MASK }}
    >
      <div
        ref={ref}
        className="flex whitespace-nowrap will-change-transform"
        style={{ transformOrigin: "center", opacity: dimOpacity }}
      >
        {[0, 1].map((copyIdx) => (
          <div key={copyIdx} className={`flex shrink-0 items-center ${scaleClass}`}>
            {items.map((token, idx) => (
              <span
                key={`${copyIdx}-${idx}`}
                className="group/tok inline-flex items-center"
              >
                <span className="px-6 sm:px-8 text-2xl sm:text-3xl lg:text-4xl font-medium tracking-[-0.025em]">
                  {token}
                </span>
                <span
                  aria-hidden
                  className="select-none text-2xl sm:text-3xl lg:text-4xl italic opacity-85 transition-[transform,opacity] duration-300 group-hover/tok:scale-125 group-hover/tok:opacity-100"
                  style={{
                    fontFamily: "var(--font-instrument-serif), Georgia, serif",
                    color: "var(--color-accent-violet)",
                    transitionTimingFunction: EASE,
                    transform: "translateY(-2px)",
                  }}
                >
                  ·
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section
      aria-hidden
      ref={wrapperRef}
      className={`relative overflow-hidden ${surface} ${className}`}
    >
      <div className="space-y-3 py-6 sm:space-y-4 sm:py-8">
        {renderRow(frontRef, "", 1)}
        {renderRow(backRef, "scale-90", 0.75)}
      </div>
    </section>
  );
}
