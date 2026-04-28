import MagneticPill from "./primitives/MagneticPill";

const HEADLINE_LINES = [
  ["Software,", "Without"],
  ["the", "Friction"],
] as const;

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

function WordMask({ word, delay }: { word: string; delay: number }) {
  return (
    <span className="inline-block overflow-hidden pr-[0.22em] align-bottom pb-[0.06em]">
      <span
        className="inline-block will-change-transform"
        style={{
          animation: "word-rise 1s cubic-bezier(0.22,1,0.36,1) both",
          animationDelay: `${delay}s`,
        }}
      >
        {word}
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
      className="relative w-full overflow-hidden bg-white min-h-screen lg:h-screen lg:min-h-[745px]"
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
      <div className="relative mx-auto flex h-full w-full max-w-[1440px] flex-col px-6 sm:px-8 lg:px-14 xl:px-20">
        {/* Headline block — Figma top 220/745 ≈ 29.5%, centered */}
        <div className="flex flex-1 flex-col justify-start pt-[22vh] sm:pt-[24vh] lg:pt-[29.5vh]">
          <h1
            className="mx-auto text-center text-black [font-family:var(--font-albert-sans),Helvetica] font-medium leading-[1]"
            style={{
              fontSize: "clamp(48px, 8.4vw, 120px)",
              letterSpacing: "-0.06em",
            }}
          >
            {HEADLINE_LINES.map((line, lineIdx) => (
              <span
                key={lineIdx}
                className="block lg:whitespace-nowrap"
                style={{ marginTop: lineIdx === 0 ? 0 : "0.02em" }}
              >
                {line.map((word, localIdx) => (
                  <WordMask
                    key={`${lineIdx}-${localIdx}-${word}`}
                    word={word}
                    delay={delayFor(lineIdx, localIdx)}
                  />
                ))}
              </span>
            ))}
          </h1>
        </div>

        {/* Bottom row — subtitle (left) + CTA (right), Figma top 560/745 ≈ 75.2% */}
        <div className="flex flex-col gap-6 pb-[5vh] lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:pb-[9vh]">
          <p
            className="max-w-[908px] text-left [font-family:var(--font-albert-sans),Helvetica] font-normal text-neutral-700 leading-[1.15] opacity-0"
            style={{
              fontSize: "clamp(20px, 2.2vw, 32px)",
              letterSpacing: "-0.06em",
              animation: "fade-up 0.75s cubic-bezier(0.22,1,0.36,1) both",
              animationDelay: `${tagDelay}s`,
            }}
          >
            A new way to build — where ideas turn into systems, and systems
            turn into products.
          </p>

          <div
            className="flex shrink-0 justify-start opacity-0 lg:justify-end"
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
