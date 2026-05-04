import Image from "next/image";
import AnimateIn from "./primitives/AnimateIn";

/**
 * Section 7 — "Our Work".
 * ────────────────────────────────────────────────────────────────────────────
 *
 *    ┌─────────────────────────────────────────┐
 *    │ HOW TO EDIT THIS SECTION:               │
 *    │                                         │
 *    │ • Add / remove / reorder brands         │
 *    │     → edit the BRANDS array             │
 *    │ • Change a logo image                   │
 *    │     → replace /public/brands/<id>.webp  │
 *    │ • Tile size, gaps, paddings, heights    │
 *    │     → TUNING block below (one place)    │
 *    │ • Typography (eyebrow + heading)        │
 *    │     → TUNING.eyebrow / TUNING.heading   │
 *    │ • Convert to auto-scrolling carousel    │
 *    │     → wrap <BrandRow /> twice inside a  │
 *    │       div with class `marquee-track`    │
 *    │       (keyframes already live in        │
 *    │        globals.css)                     │
 *    └─────────────────────────────────────────┘
 *
 * Ground truth: design/Desktop - 4.svg (Figma node 107-17871).
 *   Canvas        1440 × 700, white (#FFFFFF)
 *   Eyebrow       y=92   (top-aligned — NOT vertically centered)
 *   Heading       y=146
 *   Brand row     y=278  →  300 tall  →  ends at y=578
 *   Bottom pad    700 − 578 = 122
 *   Brand tiles   5 × (300 × 300), flush side-by-side, NO gap
 *     AST        x=80    Tamimi     x=380   Ackermans  x=680
 *     Dealshare  x=980   Foot Lock. x=1280  (extends past x=1440)
 *   Image blend   Luminosity
 *   Eyebrow       Albert Sans Regular 32 / -6% / #404040
 *   Heading       Albert Sans Medium  64 / -6% / #000000
 *
 * Responsive strategy — `clamp()` drives smooth scaling from ~375px viewport
 * up to the 1440 design ceiling.
 *
 *   Desktop (≥1024):  honors Figma exactly — 5 flush 300px tiles, last one
 *                     clips past the right edge (carousel "peek"), top-weighted
 *                     with 92px top pad.
 *   Tablet  (640–1023): 3 tiles per row, flex-wrap + centered, small gaps so
 *                       nothing hides.
 *   Mobile  (<640):    2 tiles per row, same centered grid.
 *
 * Security: each logo is a static file under `/brands/` served via a plain
 * `<img>` tag. Browsers sandbox SVG-as-image — scripts, foreign objects, and
 * external refs inside the SVG are all neutered. We never inline SVGs with
 * `dangerouslySetInnerHTML`.
 * ────────────────────────────────────────────────────────────────────────────
 */

/* ════════════════════════════════════════════════════════════════════════════
   TUNING — all the common knobs, in one place.
   All px values are AT the 1440 design. `clamp()` scales them fluidly down.
   ════════════════════════════════════════════════════════════════════════════ */
const TUNING = {
  /** Section background. Figma: solid white. */
  background: "#ffffff",

  /** Minimum section height at ≥1024px. Figma: 700. */
  desktopHeight: 700,

  /** Horizontal inset of the first tile + header. Figma: x=80. */
  desktopSidePad: 80,

  /** Vertical top inset of the eyebrow at ≥1024. Figma: y=92.
   *  Below lg, `py-16` (64px) takes over for balance. */
  desktopTopPad: 92,

  /** Tile square size. Figma: 300. min 140 keeps logos legible on phones. */
  tileSize: "clamp(140px, 20.83vw, 300px)", // 300/1440 = 20.83vw

  /** Typography — eyebrow comes from the global `.eyebrow` utility
      in globals.css. Heading is local. */
  heading: {
    size: "clamp(36px, 4.44vw, 64px)", // 64/1440 = 4.44vw
    color: "#000000",
    weight: 500,
  },
  /** Visual gap between eyebrow bottom and heading top.
   *  Figma: eyebrow-top (92) + eyebrow-h (22) → heading-top (146) = 32. */
  eyebrowToHeadingGap: "clamp(16px, 2.22vw, 32px)",

  /** Gap between header block and brand row.
   *  Figma: brand-row-top (278) − heading-bottom (~191) ≈ 87. */
  headerToRowGap: "clamp(48px, 6vw, 86px)",
} as const;

/* ────────────────────────────────────────────────────────────
   Data — single source of truth.
   ──────────────────────────────────────────────────────────── */
type Brand = {
  readonly id: string;
  readonly name: string;
  readonly src: string;
  /** Intrinsic aspect box — prevents CLS while the image decodes. */
  readonly width: number;
  readonly height: number;
};

const BRANDS: readonly Brand[] = [
  { id: "ast", name: "AST (All Stop Trading)", src: "/brands/ast.webp", width: 300, height: 300 },
  { id: "tamimi", name: "Tamimi Markets", src: "/brands/tamimi.webp", width: 300, height: 300 },
  { id: "ackermans", name: "Ackermans", src: "/brands/ackermans.webp", width: 300, height: 300 },
  { id: "dealshare", name: "Dealshare", src: "/brands/dealshare.webp", width: 300, height: 300 },
  { id: "foot-locker", name: "Foot Locker", src: "/brands/foot-locker.webp", width: 300, height: 300 },
] as const;

/* ────────────────────────────────────────────────────────────
   Single brand tile. Figma: 300×300 square, image blend Luminosity.
   ──────────────────────────────────────────────────────────── */
function BrandLogo({ brand }: { brand: Brand }) {
  return (
    <li
      className="flex aspect-square shrink-0 items-center justify-center"
      style={{ width: TUNING.tileSize }}
    >
      <Image
        src={brand.src}
        alt={brand.name}
        width={brand.width}
        height={brand.height}
        // Below the fold — let next/image lazy-load by default.
        // `sizes` matches the responsive tile clamp so next/image picks
        // the smallest source variant that won't upscale on retina.
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 300px"
        draggable={false}
        className="h-full w-full select-none object-contain"
        // Figma image-fill Blend mode: Luminosity. On black/white logos
        // over white bg this is effectively a no-op, but guarantees any
        // colored logo added later auto-desaturates to match the palette.
        style={{ mixBlendMode: "luminosity" }}
      />
    </li>
  );
}

/* ────────────────────────────────────────────────────────────
   Brand row. Extracted so a future marquee can reuse it verbatim.
   Mobile:  2 tiles/row (wrap, centered)
   Tablet:  3 tiles/row (wrap, centered)
   Desktop: 5 flush tiles, last peeks past the 1440 edge (Figma spec)
   ──────────────────────────────────────────────────────────── */
function BrandRow() {
  return (
    <ul
      aria-label="Selected clients"
      className={[
        // default list reset
        "list-none p-0 m-0",
        // mobile / tablet: balanced wrap, centered, equal gaps
        "flex flex-wrap items-center justify-center gap-x-4 gap-y-6 sm:gap-x-6",
        // desktop: one row, flush, starts at the left (tile 5 clips)
        "lg:flex-nowrap lg:justify-start lg:gap-0",
      ].join(" ")}
    >
      {BRANDS.map((brand) => (
        <BrandLogo key={brand.id} brand={brand} />
      ))}
    </ul>
  );
}

/* ────────────────────────────────────────────────────────────
   SECTION
   `overflow-hidden` honors the Figma canvas clip (Foot Locker peeks past
   x=1440 at the right edge). Without it, horizontal scroll would appear
   on desktop.
   ──────────────────────────────────────────────────────────── */
export default function Clients() {
  // CSS custom properties let us keep the layout math in this file without
  // touching globals.css. They're scoped to this section.
  const sectionVars = {
    ["--ow-side-pad" as string]: `${TUNING.desktopSidePad}px`,
    ["--ow-top-pad" as string]: `${TUNING.desktopTopPad}px`,
    ["--ow-min-h" as string]: `${TUNING.desktopHeight}px`,
  } as React.CSSProperties;

  return (
    <section
      id="our-work"
      aria-labelledby="our-work-heading"
      className="relative w-full overflow-hidden"
      style={{ background: TUNING.background, ...sectionVars }}
    >
      {/*
        Mobile / tablet: centered content with generous py padding.
        Desktop (≥lg): top-weighted to Figma spec — eyebrow at y=92,
        no forced bottom padding (natural flow respects min-height 700
        and Figma's ~122px bottom whitespace falls out for free).
      */}
      <div
        className="mx-auto flex w-full max-w-[1440px] flex-col px-6 py-16 sm:px-8 md:py-20 lg:min-h-[var(--ow-min-h)] lg:px-0 lg:pb-[clamp(48px,8.5vw,122px)] lg:pt-[var(--ow-top-pad)]"
        style={{ gap: TUNING.headerToRowGap }}
      >
        {/* Header block (eyebrow + heading) — aligned with x=80 on desktop */}
        <div className="lg:pl-[var(--ow-side-pad)]">
          <AnimateIn>
            {/* Eyebrow uses the global `.eyebrow` utility — single source
                of truth for every section pre-title. */}
            <p className="eyebrow m-0">Our Work</p>
            <h2
              id="our-work-heading"
              className="m-0"
              style={{
                fontSize: TUNING.heading.size,
                color: TUNING.heading.color,
                fontWeight: TUNING.heading.weight,
                lineHeight: 1,
                letterSpacing: "-0.06em",
                marginTop: TUNING.eyebrowToHeadingGap,
              }}
            >
              A few satisfied clients
            </h2>
          </AnimateIn>
        </div>

        {/* Brand row — aligned with x=80 on desktop; flush tiles (no right pad)
            so the last tile peeks past the 1440 edge (Figma spec). */}
        <div className="lg:pl-[var(--ow-side-pad)]">
          <AnimateIn delay={0.15}>
            <BrandRow />
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
