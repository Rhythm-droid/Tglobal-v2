/**
 * Free, dependency-free word/character splitter.
 *
 * GSAP's SplitText plugin is the de-facto standard for splitting strings
 * into per-word / per-line / per-char spans for staggered reveal
 * animations, but it's a paid Club GreenSock plugin ($150/yr). For 95%
 * of marketing-site cases (word/char fade-in on scroll, hover scramble,
 * staggered hero reveal) we don't need SplitText's full feature set
 * (line splitting after wrapping, RTL support, font-load resync). This
 * module covers the common cases.
 *
 * Tradeoffs vs. SplitText:
 *   ✓ Free, zero deps, ~30 lines of code.
 *   ✓ SSR-friendly (pure functions, no DOM access here — caller wraps).
 *   ✗ No line splitting (would require measuring rendered widths). For
 *     line reveals, split words and animate them with stagger and the
 *     visual effect is similar.
 *   ✗ No automatic resync on font-swap layout shift. We mitigate by
 *     loading fonts with `display: "swap"` and using `font-display: swap`
 *     in next/font (already done in layout.tsx).
 *
 * Usage in a React component:
 *
 *   const words = useMemo(() => splitWords(text), [text]);
 *   return (
 *     <span aria-label={text}>
 *       {words.map((word, i) => (
 *         <span key={i} aria-hidden style={{
 *           display: "inline-block",
 *           animationDelay: `${i * 40}ms`,
 *         }}>
 *           {word}{i < words.length - 1 ? " " : ""}
 *         </span>
 *       ))}
 *     </span>
 *   );
 *
 * The `aria-label` on the parent + `aria-hidden` on the spans keeps the
 * text readable to screen readers as a single string instead of N
 * separately-announced words.
 */

/** Split a string into words. Preserves the order; whitespace runs collapse to single spaces. */
export function splitWords(text: string): readonly string[] {
  return text.trim().split(/\s+/);
}

/** Split a string into individual characters (Unicode-safe via Array.from spread). */
export function splitChars(text: string): readonly string[] {
  // Array.from handles surrogate pairs (emoji, accents) correctly.
  // `text.split("")` would break multi-byte characters into halves.
  return Array.from(text);
}

/**
 * Split into both words and chars-within-words. Handy when you want a
 * scramble effect on hover (per-char) but maintain word-level layout
 * (so a long word doesn't wrap mid-word at narrow widths).
 *
 * Returns: [["F","r","i","c","t","i","o","n"], ["i","s"], ["a"], ...]
 */
export function splitWordsAndChars(text: string): readonly (readonly string[])[] {
  return splitWords(text).map((word) => splitChars(word));
}
