"use client";

/**
 * ScrambleSwap — re-runs a letter-scramble every time `text` changes.
 *
 * Difference from ScrambleText:
 *   • ScrambleText scrambles ONCE — on mount, or on hover. Changing
 *     its `text` prop while the element is already in view does NOT
 *     re-trigger the animation.
 *   • ScrambleSwap is designed for word/sentence rotation. Each time
 *     `text` changes, the previous frame's letters jumble through
 *     random characters before settling on the new target. To the
 *     reader, the OLD text "explodes" into noise and reforms into
 *     the NEW text — the canonical text-rotation effect on Awwwards
 *     / Studio Freight / cinematic-portfolio sites.
 *
 * Smoothness — throttled random refresh:
 *   Random characters are re-rolled only every RANDOM_REFRESH_MS
 *   (default 75ms ≈ 13 changes/sec). At 60fps, refreshing every
 *   frame produces a high-energy flicker that reads as harsh. At
 *   ~13fps the chars feel like a deliberate slot-wheel ticking past
 *   instead of strobing noise. The PER-FRAME reveal logic still runs
 *   at full rAF rate — only the noise source is throttled.
 *
 * Left-to-right cascade — stagger calibration:
 *   Each character has its own reveal time (`i * stagger`); larger
 *   stagger = more visible wavefront sweeping left-to-right. We aim
 *   for a stagger that scales sensibly with text length:
 *     revealWindow = duration × 0.35
 *     stagger      = clamp((duration − revealWindow) / length, 10, 60)
 *   For short text (~30 chars at 1800ms) → stagger ≈ 39ms; the
 *   wavefront is clearly visible. For long text (~200 chars at
 *   2400ms) → stagger clamps to 10ms so the body doesn't take 8s.
 *
 * Reduced motion:
 *   Animation is skipped — `display` is set to the target text
 *   immediately. The "scramble→settle" effect is purely decorative;
 *   the words themselves are the content.
 *
 * Accessibility:
 *   The mid-scramble string would announce as garbage. The wrapper
 *   span carries the canonical `text` as `aria-label`; the visible
 *   characters are `aria-hidden`.
 *
 * Usage:
 *   <ScrambleSwap text={entries[currentIndex].title} duration={1800} />
 */

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/cn";

interface ScrambleSwapProps {
  /** Target text to resolve to. Changing this prop re-runs the scramble. */
  text: string;
  /** Approximate total animation duration in ms. Default 1800. */
  duration?: number;
  /** Character pool for the random shuffles. */
  chars?: string;
  /** How often (ms) to re-roll the random characters. Lower = harsher
   *  strobe, higher = smoother slot-wheel feel. Default 75 (~13Hz). */
  randomRefreshMs?: number;
  /** Optional className passed through to the wrapping span. */
  className?: string;
}

const DEFAULT_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

export default function ScrambleSwap({
  text,
  duration = 1800,
  chars = DEFAULT_CHARS,
  randomRefreshMs = 75,
  className,
}: ScrambleSwapProps) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(text);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(text);
      return;
    }

    /* Cancel any in-progress scramble so rapidly-changing text props
       (e.g. user scrubbing scroll back and forth across a threshold)
       don't pile rAF loops on top of each other. */
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const targetChars = Array.from(text);
    const length = Math.max(targetChars.length, 1);
    /* Reveal window: the time each char spends scrambling before
       locking to its target. Stagger: how much later each successive
       char's reveal starts — the visible "left-to-right wavefront". */
    const revealWindow = duration * 0.35;
    const rawStagger = (duration - revealWindow) / length;
    const stagger = Math.max(10, Math.min(60, rawStagger));
    const totalDuration = revealWindow + length * stagger;

    /* Cached random characters, re-rolled at throttled rate. Per-
       character buckets so each position cycles independently — but
       all positions refresh on the same beat, which reads as a
       coordinated slot-wheel tick rather than chaotic flicker. */
    const cachedRandoms: string[] = targetChars.map(
      () => chars[Math.floor(Math.random() * chars.length)] ?? "?",
    );
    let lastRandomRefresh = performance.now();

    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;

      // Throttled noise refresh — only re-roll randoms at ~13Hz so
      // the chars feel like they're ticking, not flickering.
      if (now - lastRandomRefresh >= randomRefreshMs) {
        lastRandomRefresh = now;
        for (let i = 0; i < cachedRandoms.length; i++) {
          cachedRandoms[i] =
            chars[Math.floor(Math.random() * chars.length)] ?? "?";
        }
      }

      const next = targetChars
        .map((targetChar, i) => {
          /* Whitespace passes through immediately — random spaces
             look like dropouts, not character flicker. */
          if (targetChar === " " || targetChar === "\n") return targetChar;
          const revealAt = i * stagger;
          if (elapsed >= revealAt + revealWindow) {
            return targetChar;
          }
          return cachedRandoms[i] ?? targetChar;
        })
        .join("");
      setDisplay(next);

      if (elapsed < totalDuration) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        /* Final settle: hard-lock every character to target. */
        setDisplay(text);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [text, duration, chars, randomRefreshMs, reduceMotion]);

  return (
    <span
      aria-label={text}
      className={cn(className)}
      /* `tabular-nums` so each numeral/letter holds the same advance
         width while random characters cycle through — keeps the line
         from visibly "wiggling" during the scramble. */
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      <span aria-hidden>{display}</span>
    </span>
  );
}
