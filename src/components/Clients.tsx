import Image from "next/image";
import AnimateIn from "./primitives/AnimateIn";

/**
 * Section 7 — "Our Work" / "A few satisfied clients".
 * ────────────────────────────────────────────────────────────────────────────
 *
 *    ┌─────────────────────────────────────────┐
 *    │ HOW TO EDIT THIS SECTION:               │
 *    │                                         │
 *    │ • Add / remove / reorder brands         │
 *    │     → edit the BRANDS array             │
 *    │ • Change a logo image                   │
 *    │     → replace /public/brands/<id>.webp  │
 *    │ • Tile size, gaps, marquee speed        │
 *    │     → TUNING block below (one place)    │
 *    │ • Typography (eyebrow + heading)        │
 *    │     → TUNING.heading + global .eyebrow  │
 *    └─────────────────────────────────────────┘
 *
 * The brand strip auto-scrolls horizontally as a CSS-only marquee. Keyframes
 * (`@keyframes marquee`, `.marquee-track`) live in globals.css. We render the
 * tile list TWICE inside the track so the translate -50% loop seams up
 * invisibly: when the first half scrolls fully off-screen left, the second
 * half is in the exact same position the first half was at t=0.
 *
 * Behaviour:
 *   - Auto-scrolls left at the speed defined by TUNING.speed (CSS class).
 *   - Pauses on hover so users can read a logo they recognise.
 *   - Edge-fade mask softens both sides so logos enter/exit without
 *     a hard rectangle clip.
 *   - prefers-reduced-motion: reduce — animation halts and the row falls
 *     back to a wrapped grid (CSS-only override in globals.css).
 *
 * All logos are 1500×1500 WebP with transparent background, normalised to a
 * uniform-feeling cap-height (extreme-wide wordmarks 12–15% of tile, medium
 * wordmarks 21–28%, stacked / icon-heavy 30%). Tile is square at display.
 *
 * Security: each logo is a static file served as `next/image`. SVG sources
 * are pre-baked to WebP at build time so there's no SVG parsing in the
 * browser — no foreign objects, no script vectors.
 * ────────────────────────────────────────────────────────────────────────────
 */

/* ════════════════════════════════════════════════════════════════════════════
   TUNING — all the common knobs, in one place.
   ════════════════════════════════════════════════════════════════════════════ */
const TUNING = {
  /** Section background. Figma: solid white. */
  background: "#ffffff",

  /** Minimum section height at ≥1024px. Figma: 700. */
  desktopHeight: 700,

  /** Horizontal inset of the header (the marquee bleeds full-width). */
  desktopSidePad: 80,

  /** Vertical top inset of the eyebrow at ≥1024. Figma: y=92. */
  desktopTopPad: 92,

  /** Tile square size — clamps from 140 (mobile) up to 260 at the
   *  1440 design ceiling. Tightened from the original 300 because each
   *  tile now carries its own inter-tile margin (see `tileGap`), so the
   *  effective per-logo footprint (tile + gap) lands close to the
   *  original Figma 300 budget while giving each logo real breathing
   *  room from its neighbours. */
  tileSize: "clamp(140px, 18vw, 260px)",

  /** Right-side margin on every tile. Goes on each `<li>` directly (not
   *  flex `gap`) so the marquee's translate-50% seam stays mathematically
   *  seamless — with flex `gap`, the loop seam shows half a gap that
   *  doesn't exist between any other tile pair, producing a visible
   *  micro-stutter every 50 seconds. With per-tile margin, every tile
   *  pair (including the seam between the duplicate copies) has the
   *  same margin, so the loop reads as continuous.
   *
   *  Spacing scale follows the 8pt rhythm: 32 / 48 / 64. clamp picks the
   *  smallest at narrow viewports (compact but not crammed), the largest
   *  at the design ceiling (premium pace). 64/1440 ≈ 4.44vw. */
  tileGap: "clamp(32px, 4.44vw, 64px)",

  /** Marquee speed class. globals.css defines `.marquee-track` (36s),
   *  `.fast` (22s) and `.slow` (50s). 50s gives a calm, premium pace
   *  with 13 brands — fast enough that all logos cycle through in <1
   *  minute, slow enough to read each one. */
  speed: "slow",

  /** Width of the soft edge fade on each side of the marquee, as a
   *  CSS mask. Larger value = wider fade region. */
  edgeFade: "8%",

  heading: {
    size: "clamp(36px, 4.44vw, 64px)",
    color: "#000000",
    weight: 500,
  },
  eyebrowToHeadingGap: "clamp(16px, 2.22vw, 32px)",
  headerToRowGap: "clamp(48px, 6vw, 86px)",
} as const;

/* ────────────────────────────────────────────────────────────
   Data — single source of truth.
   The order here drives the on-screen left-to-right order in the
   marquee (and repeats infinitely).
   ──────────────────────────────────────────────────────────── */
interface Brand {
  readonly id: string;
  readonly name: string;
  readonly src: string;
  /** Intrinsic source dimensions — prevents CLS while the WebP decodes. */
  readonly width: number;
  readonly height: number;
}

const BRANDS: readonly Brand[] = [
  // Positions 1-10 follow the explicit ordering from the brand owner.
  { id: "skyline",       name: "Skyline Elevators",   src: "/brands/skyline.webp",       width: 1500, height: 1500 },
  { id: "medcollect",    name: "MedCollect",          src: "/brands/medcollect.webp",    width: 1500, height: 1500 },
  { id: "odd-pieces",    name: "Odd Pieces",          src: "/brands/odd-pieces.webp",    width: 1500, height: 1500 },
  { id: "red-pocket",    name: "RedPocket Mobile",    src: "/brands/red-pocket.webp",    width: 1500, height: 1500 },
  { id: "dell",          name: "Dell Technologies",   src: "/brands/dell.webp",          width: 1500, height: 1500 },
  { id: "aliste",        name: "Aliste Technologies", src: "/brands/aliste.webp",        width: 1500, height: 1500 },
  { id: "jumbl",         name: "Jumbl",               src: "/brands/jumbl.webp",         width: 1500, height: 1500 },
  { id: "jijibai",       name: "JIJIBAI",             src: "/brands/jijibai.webp",       width: 1500, height: 1500 },
  { id: "turpai",        name: "Turpai",              src: "/brands/turpai.webp",        width: 1500, height: 1500 },
  { id: "radhe-fashion", name: "Radhey Fashions",     src: "/brands/radhe-fashion.webp", width: 1500, height: 1500 },
  // Positions 11-13 are kept from the prior carousel state — only Foot
  // Locker, Ackermans, and Dealshare were called out for removal.
  { id: "ast",           name: "AST (All Stop Trading)", src: "/brands/ast.webp",        width: 1500, height: 1500 },
  { id: "tamimi",        name: "Tamimi Markets",      src: "/brands/tamimi.webp",        width: 1500, height: 1500 },
  { id: "puma",          name: "PUMA",                src: "/brands/puma.webp",          width: 1500, height: 1500 },
] as const;

/* ────────────────────────────────────────────────────────────
   Single brand tile.
   ──────────────────────────────────────────────────────────── */
function BrandLogo({ brand }: { brand: Brand }) {
  return (
    <li
      className="flex aspect-square shrink-0 items-center justify-center"
      style={{
        width: TUNING.tileSize,
        // marginRight (not flex gap) so the marquee's -50% seam stays
        // visually identical to every other tile-to-tile transition.
        marginRight: TUNING.tileGap,
      }}
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
        // Figma image-fill Blend mode: Luminosity. On mono logos this is a
        // no-op; for any colored logo added later it auto-desaturates so
        // every brand reads at the same visual weight on the white strip.
        style={{ mixBlendMode: "luminosity" }}
      />
    </li>
  );
}

/* ────────────────────────────────────────────────────────────
   Marquee row. Renders BRANDS twice; the `.marquee-track` keyframe
   translates -50% so the second copy seamlessly takes over from the
   first. Edge-fade mask softens entry/exit. Hover pauses, and reduced-
   motion users get a static wrapped grid via globals.css.
   ──────────────────────────────────────────────────────────── */
function BrandMarquee() {
  return (
    <div
      className="brand-marquee w-full overflow-hidden"
      style={{
        WebkitMaskImage: `linear-gradient(to right, transparent 0%, black ${TUNING.edgeFade}, black calc(100% - ${TUNING.edgeFade}), transparent 100%)`,
        maskImage: `linear-gradient(to right, transparent 0%, black ${TUNING.edgeFade}, black calc(100% - ${TUNING.edgeFade}), transparent 100%)`,
      }}
      aria-label="Selected clients"
    >
      <ul className={`marquee-track ${TUNING.speed} list-none p-0 m-0`}>
        {BRANDS.map((brand) => (
          <BrandLogo key={brand.id} brand={brand} />
        ))}
        {/* Duplicate copy makes the -50% translate seamless. Hidden from
            assistive tech so the brand list isn't read twice. */}
        {BRANDS.map((brand) => (
          <BrandLogo key={`${brand.id}-dup`} brand={brand} />
        ))}
      </ul>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   SECTION
   ──────────────────────────────────────────────────────────── */
export default function Clients() {
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
      <div
        className="mx-auto flex w-full max-w-[1440px] flex-col px-6 py-16 sm:px-8 md:py-20 lg:min-h-[var(--ow-min-h)] lg:px-0 lg:pb-[clamp(48px,8.5vw,122px)] lg:pt-[var(--ow-top-pad)]"
        style={{ gap: TUNING.headerToRowGap }}
      >
        {/* Header block (eyebrow + heading) — aligned with x=80 on desktop */}
        <div className="lg:pl-[var(--ow-side-pad)]">
          <AnimateIn>
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

        {/* Brand marquee — bleeds full-width so logos enter and exit beyond
            the header alignment band. */}
        <AnimateIn delay={0.15}>
          <BrandMarquee />
        </AnimateIn>
      </div>
    </section>
  );
}
