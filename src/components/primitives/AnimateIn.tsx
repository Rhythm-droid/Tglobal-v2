"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

interface AnimateInProps {
  children: ReactNode;
  /** Stagger delay in seconds. */
  delay?: number;
  /** Initial y-translation in pixels (slide-up distance). */
  y?: number;
  /** Transition duration in seconds. */
  duration?: number;
  /** Extra classes on the wrapper. */
  className?: string;
}

/**
 * Viewport-triggered fade/slide reveal — pure CSS + IntersectionObserver.
 *
 * Previously a framer-motion `motion.div`; rewrote to drop the per-section
 * JS overhead. Framer-motion ran work every frame for each instance; now
 * the browser compositor handles the transition natively on the GPU, and
 * the JS cost is a one-shot IntersectionObserver per element that
 * disconnects after firing.
 *
 * Reduced motion is honored via the `@media (prefers-reduced-motion)`
 * rule in globals.css that targets `[data-animate-in]` — server and
 * client render identical markup, CSS flips the final styles at the
 * browser level, no hydration mismatch.
 */
export default function AnimateIn({
  children,
  delay = 0,
  y = 28,
  duration = 0.7,
  className = "",
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced-motion: skip the observer entirely — the CSS rule
    // in globals.css already pins [data-animate-in] to its final state.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.setAttribute("data-in-view", "");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.setAttribute("data-in-view", "");
            io.disconnect();
            break;
          }
        }
      },
      {
        // Tiny threshold + 80px bottom rootMargin: the observer fires
        // *before* the element actually enters the viewport, so by the
        // time the user scrolls to it the CSS transition has already
        // mostly played. No more "watching it load in" on big elements.
        threshold: 0.01,
        rootMargin: "0px 0px 80px 0px",
      },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-animate-in=""
      className={`animate-in-reveal ${className}`.trim()}
      style={
        {
          "--ai-y": `${y}px`,
          "--ai-duration": `${duration}s`,
          "--ai-delay": `${delay}s`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
