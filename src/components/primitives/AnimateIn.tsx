"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

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
  /**
   * Wrapper element tag. Defaults to `div`. Use `li` when AnimateIn
   * is a direct child of a `<ul>` / `<ol>` so the list semantics
   * survive — wrapping `<li>` in a `<div>` triggers axe-core's
   * "listitem" rule (li must be direct child of a list).
   */
  as?: "div" | "li" | "section" | "article";
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
 * Reduced motion: animation runs unconditionally — brand decision.
 * The historical CSS `@media (prefers-reduced-motion)` override that
 * pinned `[data-animate-in]` to its final state has been removed
 * from globals.css.
 */
export default function AnimateIn({
  children,
  delay = 0,
  y = 28,
  duration = 0.7,
  className = "",
  as = "div",
}: AnimateInProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Reveal animation runs unconditionally — no reduced-motion
       short-circuit. Brand decision: scroll-tied reveals are part
       of the identity. (Previous code skipped the observer and set
       data-in-view immediately for `prefers-reduced-motion` users.) */

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

  // Polymorphic render via explicit per-tag JSX. We branch by tag
  // rather than using createElement(as, ...) so the linter sees a
  // standard JSX ref handoff per branch (instead of a ref-shaped
  // identifier inside a generic props object, which the
  // react-hooks/refs rule flags defensively). The ref type is
  // widened to HTMLElement; each JSX site casts to the matching
  // concrete element type since the runtime tag is known per branch.
  const combinedClassName = `animate-in-reveal ${className}`.trim();
  const style = {
    "--ai-y": `${y}px`,
    "--ai-duration": `${duration}s`,
    "--ai-delay": `${delay}s`,
  } as CSSProperties;

  if (as === "li") {
    return (
      <li
        ref={ref as React.RefObject<HTMLLIElement | null>}
        data-animate-in=""
        className={combinedClassName}
        style={style}
      >
        {children}
      </li>
    );
  }
  if (as === "section") {
    return (
      <section
        ref={ref as React.RefObject<HTMLElement | null>}
        data-animate-in=""
        className={combinedClassName}
        style={style}
      >
        {children}
      </section>
    );
  }
  if (as === "article") {
    return (
      <article
        ref={ref as React.RefObject<HTMLElement | null>}
        data-animate-in=""
        className={combinedClassName}
        style={style}
      >
        {children}
      </article>
    );
  }
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement | null>}
      data-animate-in=""
      className={combinedClassName}
      style={style}
    >
      {children}
    </div>
  );
}
