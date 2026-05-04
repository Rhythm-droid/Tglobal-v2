"use client";

import { useEffect, useId, useState } from "react";

/* Words the hero accent typewriter cycles through inside its highlight.
   All semantically map onto "things that slow software delivery", so
   the sentence still parses regardless of which word is showing:
     "Software, Without the {Friction|Limits|Bottlenecks|Delays}".
   Order matters — the cycle plays in this order forever, so put the
   strongest brand word first and rotate progressively. The longest
   word here ("Bottlenecks") sets the min-width of the highlight in
   Hero.tsx so the line never reflows mid-cycle (would otherwise jitter
   as letters add/remove). */
export const ACCENT_WORDS = [
  "Friction",
  "Limits",
  "Bottlenecks",
  "Delays",
] as const;

/* Typewriter timing — milliseconds. Tuned by feel:
     • TYPE_SPEED   slightly slower than DELETE_SPEED so typing feels
       deliberate while deletes feel like a quick erase.
     • HOLD_FULL    long enough to read each word twice over before it
       starts erasing — readability beats perceived velocity here.
     • HOLD_EMPTY   short pause at zero-length so the cycle doesn't
       flash from one word to the next; gives a beat for the eye to
       reset before new text appears. */
const TYPE_SPEED_MS = 85;
const DELETE_SPEED_MS = 38;
const HOLD_FULL_MS = 2200;
const HOLD_EMPTY_MS = 320;

/* Highlight constants — kept here (not in Hero.tsx) because the SVG
   knockout below renders both the rectangle AND the text-shaped
   holes, so the colour and corner radius live with the renderer
   instead of being plumbed through props from the parent.

   ACCENT_HIGHLIGHT_COLOUR is the rectangle's solid fill (deep ink,
   matches `--color-foreground`). The SVG mask has text rendered in
   black (alpha 0) over a white rect (alpha 1), so the rectangle is
   visible everywhere EXCEPT where the text is — text-shaped holes
   punch through the rectangle and reveal whatever is painted behind
   it (the hero page background, including the ambient purple blobs).

   This is the "true knockout" the user asked for — distinct from the
   earlier `background-clip: text` approach which only painted a
   pre-mixed gradient inside the glyph shape (no actual transparency,
   no real bg show-through). */
/* Highlight fill — pushed darker per the latest pass. The previous
   #2f2c3a felt too light for proper readable contrast; this is
   one step closer to ink while still keeping a warm violet
   undertone so the highlight harmonises with the page's purple
   wash rather than reading as an off-brand pure black chip. */
const ACCENT_HIGHLIGHT_COLOUR = "#15131e";
const ACCENT_HIGHLIGHT_RADIUS_EM = 0.10;
/* Near-full opacity. A touch of transparency (0.96) lets a hint
   of the bg blend up through the rectangle so the fill doesn't
   read as a hard opaque chip, but the contrast is now strong
   enough that the highlight is unmistakably present. */
const ACCENT_HIGHLIGHT_OPACITY = 0.96;
/* Bottom-fade applied to the rectangle so its lower edge dissolves
   into the page bg with no visible cut-line. 55% start keeps most
   of the rectangle opaque (so the contrast against the headline
   reads cleanly) while still feathering the bottom edge into the
   bg gradient. */
const BOTTOM_FADE_START_PCT = 55;
const BOTTOM_FADE_END_PCT = 100;

type Phase = "idle" | "hold-full" | "deleting" | "hold-empty" | "typing";

/* Typewriter that cycles ACCENT_WORDS forever. Mounted only inside the
   hero's accent WordMask. State machine:
     idle      — pre-typewriter, before the rise animation has finished.
                 We render the FIRST word statically so SSR matches
                 client hydration and the rise animation has something
                 to lift up.
     hold-full — full word visible, waiting HOLD_FULL_MS before erase.
     deleting  — characters peel off right-to-left at DELETE_SPEED_MS.
     hold-empty— short beat at zero length so the cycle has rhythm.
     typing    — next word's characters paint in at TYPE_SPEED_MS.
   The first cycle starts after `delay + rise duration + buffer` ms so
   the user sees the headline land before cycling begins. */
export default function AccentTypewriter({ delay }: { delay: number }) {
  const [text, setText] = useState<string>(ACCENT_WORDS[0]);
  const [wordIndex, setWordIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");

  /* Kick off the cycle once the rise animation completes. Rise duration
     is 1s (see word-rise keyframe), plus a generous buffer so the user
     gets a full read of the first word before it starts erasing. */
  useEffect(() => {
    const startMs = (delay + 1.0) * 1000 + 800;
    const t = setTimeout(() => setPhase("hold-full"), startMs);
    return () => clearTimeout(t);
  }, [delay]);

  /* Drive the state machine. Each phase schedules one timer that
     either advances the text by one character or transitions to the
     next phase. Returning the cleanup synchronously cancels the timer
     when state changes (or the component unmounts) — no leaks. */
  useEffect(() => {
    if (phase === "idle") return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const target = ACCENT_WORDS[wordIndex];

    if (phase === "hold-full") {
      timer = setTimeout(() => setPhase("deleting"), HOLD_FULL_MS);
    } else if (phase === "deleting") {
      if (text.length > 0) {
        timer = setTimeout(
          () => setText((t) => t.slice(0, -1)),
          DELETE_SPEED_MS,
        );
      } else {
        setPhase("hold-empty");
      }
    } else if (phase === "hold-empty") {
      timer = setTimeout(() => {
        setWordIndex((i) => (i + 1) % ACCENT_WORDS.length);
        setPhase("typing");
      }, HOLD_EMPTY_MS);
    } else if (phase === "typing") {
      if (text.length < target.length) {
        timer = setTimeout(
          () => setText(target.slice(0, text.length + 1)),
          TYPE_SPEED_MS,
        );
      } else {
        setPhase("hold-full");
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [phase, text, wordIndex]);

  const blinking = phase !== "typing" && phase !== "deleting";
  const maskId = useId();
  const gradientId = useId();

  /* Render layout:
     ─────────────────────────────────────────────────────────────────
     1. Hidden HTML text — `visibility: hidden` so it paints nothing
        but reserves the inline width matching the typewriter's current
        text. The parent (WordMask inner span) sizes to this width, so
        the SVG below — set to width:100% height:100% — gets the right
        dimensions to render its rectangle and the masked text inside.
        We render a non-breaking space when text is empty so the box
        doesn't collapse to 0 during the brief hold-empty pause; the
        nbsp width is roughly half a regular char which keeps the rect
        visible without a visible "stuttering shrink".
     2. SVG knockout rectangle — `position: absolute; inset: 0` fills
        the entire parent padded box. A <mask> contains:
          • A bottom-fade gradient (white at top, transparent at the
            bottom) so the rectangle's lower edge dissolves cleanly
            into whatever paints behind it.
          • A black <text> on top of the gradient, which punches
            text-shaped HOLES through the rectangle. Through these
            holes the user sees whatever paints behind the SVG — i.e.
            the actual hero page background, including the ambient
            purple blobs. This is the TRUE knockout the user asked
            for, where letters are real cut-outs rather than text
            painted in a colour that approximates the bg.
        SVG <text> uses the same font-family/style/size as the
        hidden HTML text (Instrument Serif italic, 1em) and is
        positioned at x = parent paddingLeft (0.20em) and
        y = paddingTop + ascent (~0.82em) so the holes line up
        precisely with where the HTML text WOULD render. Since both
        renderings use the same font metrics, alignment is reliable
        across browsers.
     3. Caret — `position: relative; z-index: 2` so it paints above
        the SVG knockout (which sits at default stacking-context
        level for absolutely-positioned children, above the inline
        hidden text). Without the explicit z-index the caret would
        be hidden behind the rectangle. */
  return (
    <>
      {/* Layout-only span. `visibility: hidden` AND `aria-hidden` are
          both required: visibility:hidden reserves the inline width
          for the SVG to size against, but it also hides the text from
          screen readers; aria-hidden makes that intent explicit. The
          accessible-name span below carries the H1's actual word for
          assistive tech. */}
      <span aria-hidden style={{ visibility: "hidden" }}>
        {text || " "}
      </span>
      {/* Accessible text layer. Renders the FIRST word from
          ACCENT_WORDS as a static, screen-reader-only string so the
          parent H1 reads as "Software, Without the Friction" without
          attempting to announce every cycling change (which would be
          chatty and unhelpful). The visible cycling is purely a
          sighted-user effect; SR users get a clean, complete sentence.
          clip-path positioning keeps it visible to AT while invisible
          to sight. */}
      <span
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {ACCENT_WORDS[0]}
      </span>
      <svg
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset={`${BOTTOM_FADE_START_PCT}%`} stopColor="white" stopOpacity="1" />
            <stop offset={`${BOTTOM_FADE_END_PCT}%`} stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id={maskId}>
            {/* Bottom-fade alpha base */}
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill={`url(#${gradientId})`}
            />
            {/* Text in black = alpha 0 = punches through the rectangle */}
            <text
              x="0.20em"
              y="0.82em"
              style={{
                fontFamily:
                  "var(--font-instrument-serif), Georgia, serif",
                fontStyle: "italic",
                fontSize: "1em",
              }}
              fill="black"
            >
              {text}
            </text>
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={ACCENT_HIGHLIGHT_COLOUR}
          fillOpacity={ACCENT_HIGHLIGHT_OPACITY}
          rx={`${ACCENT_HIGHLIGHT_RADIUS_EM}em`}
          mask={`url(#${maskId})`}
        />
      </svg>
      {/* Caret — see top-of-component render comment for rationale.
          Height 0.70em sits between x-height and cap-height of the
          serif italic, proportional but not dominant. Background is
          fixed white because there's no inherited text colour to
          pick up — the visible "text" is now the SVG knockout, not
          a CSS-coloured glyph. */}
      <span
        aria-hidden
        style={{
          position: "relative",
          zIndex: 2,
          display: "inline-block",
          width: "0.05em",
          height: "0.70em",
          marginLeft: "0.06em",
          backgroundColor: "#ffffff",
          verticalAlign: "baseline",
          transform: "translateY(-0.02em)",
          animation: blinking ? "caret-blink 1s steps(2, jump-none) infinite" : "none",
        }}
      />
    </>
  );
}
