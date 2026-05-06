"use client";

/**
 * ScrambleText — letter shuffle effect that resolves to the target text.
 *
 * Two modes:
 *   • `trigger="mount"` — runs once when the component first appears
 *     in the viewport. Good for hero accents.
 *   • `trigger="hover"` — runs every time the parent is hovered.
 *     Good for nav links, footer wordmark, CTAs.
 *
 * Implementation:
 *   • `requestAnimationFrame` loop that, for each character position,
 *     cycles through random characters until reaching the "settle"
 *     time, then locks in the target character.
 *   • Characters are revealed left-to-right with a stagger so the
 *     final string composes from left.
 *   • Total animation time = (text.length × stagger) + settle.
 *
 * Why custom rAF, not framer-motion:
 *   framer-motion is best at numeric tweens (positions, opacity).
 *   This animation is "every frame, replace each char with a random
 *   one until settled" — closer to a spritesheet than a tween. A
 *   simple rAF is more direct and avoids needing a per-character
 *   motion value.
 *
 * Reduced motion:
 *   We skip the scramble entirely and show the final text immediately.
 *   The "scramble→settle" feel is decorative; the text is the content.
 *
 * Accessibility:
 *   The animating string would be wildly disruptive to screen readers
 *   (announcing "X1$#@! ... Y2&^! ..."). The wrapper carries the final
 *   text as `aria-label`, and the visible spans are `aria-hidden`.
 *
 * Usage:
 *   <ScrambleText text="Friction" />
 *   <ScrambleText text="Hover me" trigger="hover" duration={400} />
 */

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

interface ScrambleTextProps {
  /** Final text to resolve to. */
  text: string;
  /** When the animation runs. */
  trigger?: "mount" | "hover";
  /** Total animation duration in ms. */
  duration?: number;
  /** Per-character stagger in ms — controls the "left-to-right reveal" pace. */
  stagger?: number;
  /** Characters to pull random shuffles from. */
  chars?: string;
  /** Optional className passed through to the wrapping span. */
  className?: string;
}

const DEFAULT_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

export default function ScrambleText({
  text,
  trigger = "mount",
  duration = 800,
  stagger = 40,
  chars = DEFAULT_CHARS,
  className,
}: ScrambleTextProps) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(text);
  const rafRef = useRef<number | null>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  /* Core scramble loop. Each character has a `revealAt` time computed
     from its index × stagger. Before revealAt, it's a random char.
     After revealAt, it's locked to the target.
     We render via setState here (not direct DOM mutation) because the
     component is small enough that React reconciliation cost is
     negligible — the simpler the code, the fewer the bugs. */
  function runScramble() {
    if (reduceMotion) {
      setDisplay(text);
      return;
    }
    const start = performance.now();
    const targetChars = Array.from(text);

    function tick(now: number) {
      const elapsed = now - start;
      const next = targetChars
        .map((targetChar, i) => {
          /* Whitespace passes through immediately — no point shuffling
             a space, looks weird. */
          if (targetChar === " ") return " ";
          const revealAt = i * stagger;
          if (elapsed >= revealAt + duration / targetChars.length) {
            return targetChar;
          }
          if (elapsed < revealAt) {
            /* Not yet revealed — show random. */
            return chars[Math.floor(Math.random() * chars.length)];
          }
          /* Currently animating — show random. */
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");
      setDisplay(next);

      const totalDuration = duration + targetChars.length * stagger;
      if (elapsed < totalDuration) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        /* Final settle: lock all characters to target. */
        setDisplay(text);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  /* Mount mode: run once when the element enters the viewport.
     Hover mode: bind to mouseenter on the wrapper. */
  useEffect(() => {
    if (trigger !== "mount") return;
    const el = wrapperRef.current;
    if (!el) return;

    /* IntersectionObserver fires once — we use it instead of `useInView`
       hook to keep the dependency on framer-motion minimal in this file. */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          runScramble();
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    /* `text` in deps so changing the prop triggers a re-scramble on
       next mount. The other props (stagger/duration/chars) intentionally
       don't trigger re-runs — they affect future scrambles only. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, trigger]);

  function handleMouseEnter() {
    if (trigger === "hover") runScramble();
  }

  return (
    <span
      ref={wrapperRef}
      onMouseEnter={handleMouseEnter}
      aria-label={text}
      className={cn("inline-block", className)}
      /* `tabular-nums` keeps each glyph at the same width so the
         scrambled string doesn't visibly "wiggle" as random characters
         of different widths cycle through. */
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      <span aria-hidden>{display}</span>
    </span>
  );
}
