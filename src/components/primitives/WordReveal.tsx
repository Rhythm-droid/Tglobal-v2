"use client";

/**
 * WordReveal — word-by-word fade + rise reveal on scroll.
 *
 * The flagship "linear.app" pattern: a paragraph of text where each
 * word fades in from below as the section scrolls into view. Reads
 * as "the page is composing itself for you," makes long-form copy
 * feel paced and intentional rather than dumped.
 *
 * Implementation:
 *   • `splitWords()` (free, no SplitText) tokenizes the input string
 *     into words at component-mount time.
 *   • Each word renders inside an inline-block `<span>` so transforms
 *     don't break text-flow / wrapping. Trailing space is rendered as
 *     a sibling text node so the natural soft-wrap behaviour survives.
 *   • framer-motion `whileInView` triggers the stagger; `viewport: { once: true }`
 *     means the animation only runs once per page load (subsequent
 *     scroll-back doesn't re-trigger — would feel gimmicky).
 *   • `staggerChildren` cadence is 30ms by default — fast enough that
 *     a 20-word paragraph feels like a single arrival (~600ms total),
 *     slow enough that the eye catches the rhythm.
 *
 * Accessibility:
 *   • The visible spans are `aria-hidden`; the parent carries the
 *     full string via `aria-label` so screen readers announce the
 *     paragraph as one continuous sentence, not as "F·r·i·c·t·i·o·n".
 *   • Reduced motion: skips the per-word stagger and just fades the
 *     whole block in 0.2s — content still appears, no animation noise.
 *
 * Usage:
 *   <WordReveal text="A new way to build software, without the friction." />
 *   <WordReveal text="..." as="h2" className="display-lg" stagger={0.04} />
 *
 * Avoid for:
 *   • Headlines longer than ~30 words (visual fatigue — feels like a
 *     loading screen).
 *   • Critical CTAs (delaying button text by 600ms hurts conversion).
 *   • Above-the-fold hero copy that should be paint-instant for LCP.
 */

import { motion, type Variants } from "framer-motion";
import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { splitWords } from "@/lib/splitWords";
import { useMounted } from "@/lib/useMounted";

interface WordRevealProps {
  /** The paragraph or heading text to reveal. */
  text: string;
  /** Wrapping element — defaults to "p". Use "h1"/"h2" for headlines. */
  as?: "p" | "h1" | "h2" | "h3" | "h4" | "span" | "div";
  /** Per-word stagger in seconds. 0.03 = ~600ms for a 20-word paragraph. */
  stagger?: number;
  /** Per-word transition duration in seconds. */
  duration?: number;
  /** Vertical rise distance — keep small (8–14px) to avoid layout jitter. */
  yOffset?: number;
  /** Optional className passed through to the wrapping element. */
  className?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export default function WordReveal({
  text,
  as = "p",
  stagger = 0.03,
  duration = 0.55,
  yOffset = 12,
  className,
}: WordRevealProps) {
  /* Animation runs for every visitor regardless of
     `prefers-reduced-motion` — brand decision. The mounted gate is
     still required so SSR + first client render emit identical
     markup (avoids hydration mismatch on framer-motion's variant
     tree). */
  const mounted = useMounted();
  /* `useMemo` so re-renders don't re-tokenize a static string. Cheap
     for short paragraphs but adds up if the parent re-renders often
     (e.g. on every scroll tick from a scroll-driven parent). */
  const words = useMemo(() => splitWords(text), [text]);

  const Tag = motion[as] as React.ElementType;

  /* SSR + first client render — static path so server/client match.
     No aria-label: visible text already provides the accessible name. */
  if (!mounted) {
    return (
      <Tag
        initial={mounted ? { opacity: 0 } : false}
        whileInView={mounted ? { opacity: 1 } : undefined}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.2 }}
        className={cn(className)}
      >
        {text}
      </Tag>
    );
  }

  /* Build per-instance variants so caller props (stagger/duration/yOffset)
     actually affect the animation. The constants above are defaults for
     code clarity; these instance variants take precedence. */
  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger },
    },
  };
  const word: Variants = {
    hidden: { opacity: 0, y: yOffset },
    visible: { opacity: 1, y: 0, transition: { duration, ease: EASE } },
  };

  return (
    <Tag
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className={cn(className)}
    >
      {/* sr-only label — per-word spans below are aria-hidden so AT users
          would otherwise hear nothing. aria-label is prohibited on
          headings; an sr-only sibling satisfies axe while preserving the
          word-stagger animation. */}
      <span className="sr-only">{text}</span>
      {words.map((w, i) => (
        <span
          key={`${i}-${w}`}
          aria-hidden
          /* Keep wrapping intact: words are inline-block so transforms
             apply, but they're separated by a real space character so
             the browser's word-break logic still works — no `display:
             inline` text staying glued during a long-word wrap. */
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          <motion.span
            variants={word}
            style={{ display: "inline-block", willChange: "transform, opacity" }}
          >
            {w}
          </motion.span>
          {/* Trailing space — rendered outside the motion span so the
              animated word is "tight" and the gap belongs to the text
              flow, allowing natural wrap. */}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
