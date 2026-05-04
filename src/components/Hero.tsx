import MagneticPill from "./primitives/MagneticPill";
import AccentTypewriter from "./primitives/AccentTypewriter";

/* Headline tokens. Each is either a plain string (sans-serif rise) or a
   tagged object marking it as the editorial-accent word — italic
   Instrument Serif on a lime-green marker highlight, with a typewriter
   cycle between friction-synonym words. We highlight one token per
   headline; the LAST line ends with the cycling accent so the headline
   reads as one unit but pays off the differentiator at the end. */
type HeadlineWord = string | { text: string; accent: true };
const HEADLINE_LINES: ReadonlyArray<ReadonlyArray<HeadlineWord>> = [
  ["Software,", "Without"],
  ["the", { text: "Friction", accent: true }],
] as const;

/* The cycling word list, timing tunings, highlight colour, fade
   gradient, AND the visible knockout rendering (rectangle with
   text-shaped holes via SVG mask) all live in
   primitives/AccentTypewriter.tsx. That file is the only client
   component in the hero subtree, keeping Hero itself a server
   component. WordMask below only handles the SHARED rise animation
   + soft-edge reveal mask that all headline words use. */

/**
 * Three blur ellipses — Figma frame 1440×745.
 *  - Ellipse 7183 @ (874, 106)  top-right upper
 *  - Ellipse 7182 @ (1124, 389) right middle
 *  - Ellipse 7184 @ (154, 389)  left middle
 * All 285×285, fill #4B28FF, layer blur 250px.
 * Percentages are Figma-position / frame-dimension so the blobs
 * translate exactly inside the 1440-capped centered canvas below.
 */
const GLOW_BLOBS = [
  { top: "14.23%", left: "60.69%" }, // 106/745, 874/1440
  { top: "52.21%", left: "78.06%" }, // 389/745, 1124/1440
  { top: "52.21%", left: "10.69%" }, // 389/745, 154/1440
] as const;

/* Soft-edge reveal mask — used on the outer WordMask span.
   ─────────────────────────────────────────────────────────
   `overflow: hidden` alone produces a sharp horizontal cut at the
   container's bottom edge, so a rising word appears to emerge from a
   "knife edge". The boss flagged that as visually abrupt. To soften
   it we layer a CSS mask gradient on top of the same box: opaque from
   0–78%, fading to transparent across 78–100%. As the word rises:
     • the part of the word that's already in the 0–78% band paints
       at full opacity (no visual difference from before);
     • the part still in the 78–100% band fades smoothly toward zero
       so the bottom edge looks like a soft halo rather than a clip;
     • anything translated below 100% is double-protected by both
       overflow:hidden AND mask alpha 0 — invisible.
   At rest the small fade overlap at the baseline reads as premium
   polish (descenders on the comma in "Software," fade slightly) and
   is intentional — testing showed eliminating it requires growing the
   line-box vertically, which would change line-spacing in the headline. */
const SOFT_REVEAL_MASK =
  "linear-gradient(180deg, black 0%, black 78%, transparent 100%)";

function WordMask({
  word,
  delay,
  accent = false,
}: {
  word: string;
  delay: number;
  accent?: boolean;
}) {
  /* Accent words need extra vertical room so the highlight box can
     wrap the entire italic-serif glyph (cap-top above the line-box top,
     no descenders for the chosen words but we leave room anyway). We
     extend the OUTER span's padding-top/bottom and offset with negative
     margins so the surrounding line layout doesn't shift. Same pattern
     on the inner span, with the highlight rectangle filling the inner
     span's padding-box via `inset: 0`. The negative margins net to zero
     so neighbouring words ("the") don't move. */
  /* Top extension is small (0.04em) so the highlight doesn't reach up
     into the line-above's descender zone — the comma in "Software,"
     drops a tail just below its baseline and at line-height:1 that
     tail lands within ~0.05em of the next line's top, so any larger
     top overshoot here causes the highlight to brush against (or
     overlap) the comma. Bottom keeps a slightly larger 0.10em
     extension because there's no line below the accent word to
     collide with, and italic serif ascenders/descenders sometimes
     dip a hair under the baseline. */
  const outerStyle: React.CSSProperties = {
    WebkitMaskImage: SOFT_REVEAL_MASK,
    maskImage: SOFT_REVEAL_MASK,
    paddingTop: accent ? "0.04em" : undefined,
    paddingBottom: accent ? "0.10em" : "0.06em",
    marginTop: accent ? "-0.04em" : undefined,
    marginBottom: accent ? "-0.04em" : undefined,
  };
  return (
    <span
      className="inline-block overflow-hidden pr-[0.22em] align-bottom"
      style={outerStyle}
    >
      <span
        className="inline-block will-change-transform"
        style={{
          animation: "word-rise 1s cubic-bezier(0.22,1,0.36,1) both",
          animationDelay: `${delay}s`,
          /* Accent words swap to Instrument Serif italic (registered in
             layout.tsx). Padding gives the highlight room to extend
             beyond the natural glyph metrics on all sides; negative
             margin offsets the visual position so the sentence reads
             on the same baseline as the surrounding sans-serif words.

             color: #ffffff — white text on near-black highlight reads
             as a high-contrast editorial accent.

             No `min-width` — the highlight box is sized purely by its
             content (current typewriter text + padding). As the cycle
             swaps Friction → Limits → Bottlenecks → Delays the box
             grows and shrinks naturally. The downstream effect is the
             surrounding word "the" shifting horizontally as the cycle
             plays; the headline is centered so the whole line slides
             a few pixels each cycle, which reads as a deliberate
             editorial gesture rather than a layout bug. */
          ...(accent && {
            position: "relative",
            fontFamily: "var(--font-instrument-serif), Georgia, serif",
            fontStyle: "italic",
            fontWeight: 400,
            /* The accent's visible rendering (rectangle + text-shaped
               holes) is handled entirely inside <AccentTypewriter />
               via SVG masking — see primitives/AccentTypewriter.tsx.
               The HTML text rendered here is hidden (`visibility:
               hidden`) and exists only to reserve the parent's
               layout width to match the SVG-rendered text. We keep
               the matching font-family/style here so the hidden
               text's metrics (= layout width) are identical to the
               SVG mask's text — letter-perfect alignment. */
            /* Padding extends the highlight box past the natural glyph
               bounds. Top is small (0.04em — see outerStyle for the
               comma-overlap rationale) and bottom is larger (0.10em).
               Horizontal padding stays at 0.20em with matching
               negative margin so the surrounding sans-serif words
               ("the") don't shift. Net horizontal layout impact is
               zero — the highlight is purely visual overshoot. */
            padding: "0.04em 0.20em 0.10em",
            margin: "-0.04em 0 -0.10em",
          }),
        }}
      >
        {accent ? <AccentTypewriter delay={delay} /> : word}
      </span>
    </span>
  );
}

function ScrollbarDecor({
  className,
  delay,
}: {
  className: string;
  delay: number;
}) {
  // 124×21 group. Ellipse (21×21) at x=0, Line (108×1) at x=16 so they
  // overlap by 5px — matches Figma auto-layout spacing: -5.
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute hidden opacity-0 md:block ${className}`}
      style={{
        width: 124,
        height: 21,
        animation: "fade-in 0.7s ease both",
        animationDelay: `${delay}s`,
      }}
    >
      {/* Line FIRST → renders below. Dot SECOND → renders on top.
          (Later DOM siblings stack above earlier ones at the same z-index.) */}
      <span
        className="absolute bg-[#D9D9DE]"
        style={{
          left: 16,
          top: "calc(50% - 1px)",
          width: 108,
          height: 2,
        }}
      />
      <span
        className="absolute left-0 top-0 block rounded-full border border-solid border-[#DFE1E7] bg-white"
        style={{
          width: 21,
          height: 21,
          boxShadow:
            "0 1px 2px rgba(13,13,18,0.04), 0 1px 3px rgba(13,13,18,0.05)",
        }}
      />
    </div>
  );
}

export default function Hero() {
  const flat = HEADLINE_LINES.flatMap((line, lineIdx) =>
    line.map((word, i) => ({ word, lineIdx, localIdx: i }))
  );
  const delayFor = (lineIdx: number, localIdx: number) => {
    const gi = flat.findIndex(
      (w) => w.lineIdx === lineIdx && w.localIdx === localIdx
    );
    return 0.15 + Math.max(0, gi) * 0.08;
  };
  const tagDelay = 0.15 + flat.length * 0.08 + 0.05;
  const ctaDelay = tagDelay + 0.12;
  const dashDelay = tagDelay + 0.2;

  return (
    <section
      id="top"
      aria-label="Hero"
      className="relative flex w-full flex-col overflow-hidden bg-white min-h-[50svh] sm:min-h-screen lg:h-screen lg:min-h-[745px]"
    >
      {/* Soft base wash — white top fading to lavender, plus a subtle radial
          pulled from the blob cluster so the purple reads even when heavy blur
          diffuses the three hard ellipses below */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 55% 42%, rgba(117,95,255,0.14) 0%, rgba(75,40,255,0) 70%)," +
            "linear-gradient(180deg, #ffffff 0%, #f6f1ff 55%, #ede4ff 100%)",
        }}
      />

      {/* Base dot-grid wash — 14px grid per Figma */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(75,40,255,0.05)_1px,transparent_1px)] [background-size:14px_14px]"
      />

      {/*
        Full-bleed responsive stripes — tile size 102.857px (1440/14) so
        at 1440 viewport you get Figma's 14 columns; at any other viewport
        the count auto-adapts (~7 at 768, ~19 at 1920, ~37 at 4K).
        Implemented as a tiled CSS background (one DOM node, one paint
        layer) instead of N divs for cheaper paint and zero JS.
        `mask-image` fades the leftmost and rightmost 5% of the viewport
        so stripes don't hard-cut at the edges.

        Stays OUTSIDE the 1440 canvas (which keeps glow blobs + scrollbar
        decorations at their Figma-spec positions) so stripes go full-bleed
        independently of the design canvas.

        Tile composition (top → bottom of background-image stack):
          • 1px white divider on the LEFT edge of every tile (mirrors
            the original `border-r` + `first:border-l` rhythm so dividers
            sit at every 102.857px boundary, including x=0).
          • 270° gradient: rgba(0,0,0,0.035) at the right edge fading to
            rgba(0,0,0,0) at the left — same as the original per-stripe
            gradient. Direct alpha (no mix-blend-mode) because overlay-mode
            at 15% reads almost invisible over a lavender base in
            Chrome/Firefox, unlike Figma's renderer.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(255,255,255,0.3) 0, rgba(255,255,255,0.3) 1px, transparent 1px, transparent 100%)," +
            "linear-gradient(270deg, rgba(0,0,0,0.035) 0%, rgba(0,0,0,0) 100%)",
          backgroundSize: "102.857px 100%, 102.857px 100%",
          backgroundRepeat: "repeat-x, repeat-x",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.4) 8%, black 16%, black 84%, rgba(0,0,0,0.4) 92%, transparent 100%)",
          maskImage:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.4) 8%, black 16%, black 84%, rgba(0,0,0,0.4) 92%, transparent 100%)",
        }}
      />

      {/*
        Figma 1440×745 canvas — holds the 3 blur ellipses only. Their
        positions are percentages of this 1440-capped canvas so the glow
        cluster stays centered on wider viewports (the stripes and
        scrollbars above/below go full-bleed independently).
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mx-auto hidden max-w-[1440px] md:block"
      >
        {/* 3 brand-primary glow blobs — fixed 285×285, blur 250px, #4B28FF */}
        {GLOW_BLOBS.map((blob, i) => (
          <div
            key={i}
            className="absolute h-[285px] w-[285px] rounded-full bg-[#4B28FF]"
            style={{
              top: blob.top,
              left: blob.left,
              filter: "blur(250px)",
            }}
          />
        ))}
      </div>

      {/*
        Scrollbar decorations — anchored to the VIEWPORT edges (full-bleed),
        siblings of the 1440 canvas instead of children. At 1440 viewport
        the viewport edge coincides with the canvas edge so positioning is
        identical to Figma; on wider viewports they ride the viewport edge
        outward (instead of staying tucked at the canvas edge), matching
        the same full-bleed treatment as the stripes above.
          Scrollbar 1 (left):  X=-16, Y=254 → left:-16px, top:34.09%
          Scrollbar 2 (right): X=1327, Y=668, rot 180° → right:-11px, top:95%
      */}
      <ScrollbarDecor
        className="left-[-16px] top-[34.09%] rotate-180"
        delay={dashDelay}
      />
      <ScrollbarDecor
        className="right-[-11px] top-[95%]"
        delay={dashDelay + 0.08}
      />

      {/* Mobile soft glow — single centered blob since the 3-ellipse composition
          collapses on narrow screens */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[35%] h-[340px] w-[340px] -translate-x-1/2 rounded-full bg-[#4B28FF] opacity-40 blur-[160px] md:hidden"
      />

      {/* Content container — 1440 max, Figma positions via percentages of 745h */}
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-6 sm:px-8 lg:px-14 xl:px-20">
        {/* Headline block — Figma top 220/745 ≈ 29.5%, centered */}
        <div className="flex flex-1 flex-col justify-start pt-28 sm:pt-[24vh] lg:pt-[29.5vh]">
          <h1
            className="mx-auto text-center text-black font-medium leading-[1]"
            style={{
              fontSize: "clamp(48px, 8.4vw, 120px)",
              letterSpacing: "-0.06em",
            }}
          >
            {HEADLINE_LINES.map((line, lineIdx) => {
              /* Line-2 (and beyond) gets a slightly larger top gap when
                 it contains an accent token — the highlight box rises
                 ~0.04em above the line-box top via padding, and at
                 line-height: 1 the previous line's descenders (e.g.
                 the comma in "Software,") drop low enough to graze
                 the highlight. 0.10em (≈12px at 120px headline) opens
                 enough breathing room to fully clear the descender
                 without visibly fragmenting the headline. Lines
                 without an accent keep the original tight 0.02em. */
              const hasAccent = line.some(
                (t) => typeof t === "object" && t.accent,
              );
              const gap = lineIdx === 0 ? 0 : hasAccent ? "0.10em" : "0.02em";
              return (
              <span
                key={lineIdx}
                className="block lg:whitespace-nowrap"
                style={{ marginTop: gap }}
              >
                {line.map((token, localIdx) => {
                  const text = typeof token === "string" ? token : token.text;
                  const accent = typeof token === "object" && token.accent;
                  return (
                    <WordMask
                      key={`${lineIdx}-${localIdx}-${text}`}
                      word={text}
                      delay={delayFor(lineIdx, localIdx)}
                      accent={accent}
                    />
                  );
                })}
              </span>
              );
            })}
          </h1>
        </div>

        {/* Bottom row — subtitle (left) + CTA (right), Figma top 560/745 ≈ 75.2% */}
        <div className="flex flex-col gap-6 pb-[8vh] lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:pb-[9vh]">
          <p
            className="max-w-[908px] text-center lg:text-left font-normal text-neutral-700 leading-[1.15] opacity-0"
            style={{
              fontSize: "clamp(20px, 2.2vw, 32px)",
              letterSpacing: "-0.06em",
              animation: "fade-up 0.75s cubic-bezier(0.22,1,0.36,1) both",
              animationDelay: `${tagDelay}s`,
            }}
          >
            A new way to build — where ideas turn into systems, and systems
            turn into products. AI-native engineering that ships 4× faster,
            with humans still in charge.
          </p>

          <div
            className="flex shrink-0 justify-center opacity-0 lg:justify-end"
            style={{
              animation: "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
              animationDelay: `${ctaDelay}s`,
            }}
          >
            <MagneticPill href="#talk-to-us" variant="primary">
              Book a call with us
            </MagneticPill>
          </div>
        </div>
      </div>

      {/* Soft fade into next section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0) 0%, #ffffff 100%)",
        }}
      />
    </section>
  );
}
