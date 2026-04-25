import AnimateIn from "./primitives/AnimateIn";
import ToolsCard from "./problem/ToolsCard";
import CyclesCard from "./problem/CyclesCard";
import ScalingCard from "./problem/ScalingCard";
import TGlobalCard from "./problem/TGlobalCard";

/**
 * Section 3 — "Problem with Development Currently"
 * ────────────────────────────────────────────────────────────
 *
 *    ┌──────────────────────────────────────────────────────┐
 *    │ HOW TO EDIT THIS SECTION                             │
 *    │                                                      │
 *    │ • Copy (eyebrow, heading, description)               │
 *    │     → COPY block below                               │
 *    │ • Shared spacing, radii, rail colors, type scale     │
 *    │     → TUNING block below                             │
 *    │ • A specific card's content or illustration          │
 *    │     → src/components/problem/<Card>.tsx              │
 *    │ • The decorative rails/corner dots between cards     │
 *    │     → CornerDot + Rail components below              │
 *    └──────────────────────────────────────────────────────┘
 *
 * Figma: 1440 × ~850 section, white-ish bg (#f7f9ff).
 *   Header block at top (eyebrow 14–16 / heading 72–80 / description 18–20)
 *   2 × 2 card grid with a subtle #dfe1e7 stroked rail around each row
 *   Corner dots at every intersection — the "blueprint" motif.
 *
 * Responsive:
 *   <lg: single-column card stack, rails hidden (no visual payoff on mobile).
 *   ≥lg: spec-exact 2 × 2 grid with rails + corner dots.
 *
 * Server component: AnimateIn (the only client dependency) is imported by
 * a server component, which is allowed and keeps Problem itself off the
 * client bundle.
 * ────────────────────────────────────────────────────────────
 */

/* ─── COPY ─────────────────────────────────────────────────── */
const COPY = {
  eyebrow: "Problem with Development Currently",
  heading: "Building Software Is Still Too Slow",
  description:
    "Despite better tools, teams still struggle to ship fast and scale efficiently.",
} as const;

/* ─── TUNING ───────────────────────────────────────────────── */
const TUNING = {
  /** Figma section background. */
  background: "#f7f9ff",
  /** Max canvas width — matches the 1440 Figma frame. */
  maxWidth: 1440,
  /** Side padding / vertical padding at common breakpoints. */
  pad: {
    sideMobile: "1.5rem", // 24px
    sideTablet: "2.5rem", // 40px
    sideDesktop: "7.5rem", // 120px
    yMobile: "4rem", // 64px
    yDesktop: "5rem", // 80px
  },
  /** Gap between header and the card grid. */
  headerToGridGap: "3rem",
  /** Gap between rows of the card grid on desktop. */
  rowGap: "1.25rem",
  /** Gap between the two columns on desktop. */
  colGap: "1.25rem",
  /** Rail + corner-dot spec (dot stroke #DFE1E7 21px per Pagination.svg; rail stroke #DEE3E8 per Divider Container.svg). */
  rail: {
    railStroke: "#dee3e8",
    dotStroke: "#dfe1e7",
    dotSize: 21,
    dividerWidth: 20,
  },
  /** Header column widths (Figma: heading 526, description 606). */
  headerCols: {
    heading: "526px",
    description: "606px",
  },
  /**
   * Typography — Figma-exact at ≥1440, fluidly scaled below via clamp().
   * The MAX in every clamp is the Figma value; the min is a comfortable
   * floor for ~375px viewports.
   */
  type: {
    // Eyebrow + description share spec: Albert Sans Regular 20/28
    eyebrow: {
      size: "clamp(16px, 1.389vw, 20px)", // 20/1440 = 1.389vw
      lineHeight: "1.4", // 28/20
      color: "#2f2b43b2", // #2F2B43 @ 70%
    },
    // Heading: Albert Sans Medium 54/68 / -2%
    heading: {
      size: "clamp(36px, 3.75vw, 54px)", // 54/1440 = 3.75vw
      lineHeight: "1.26", // 68/54
      tracking: "-0.02em", // Figma -2%
      color: "#010101",
    },
    description: {
      size: "clamp(16px, 1.389vw, 20px)",
      lineHeight: "1.4",
      color: "#2f2b43b2",
    },
  },
} as const;

/* ─── Rail primitives ─────────────────────────────────────────
   Solid thin line + 21px ringed dots at the corners. Used to draw
   the Figma "blueprint" frame around each row.
   ─────────────────────────────────────────────────────────── */
function CornerDot() {
  return (
    <span
      aria-hidden
      className="block h-[21px] w-[21px] rounded-full border border-[#dfe1e7] bg-white shadow-[0px_1px_2px_#0d0d120a,0px_1px_3px_#0d0d120d]"
    />
  );
}

function HRail() {
  return <span aria-hidden className="block h-px flex-1 bg-[#dee3e8]" />;
}

// NOTE: no `flex-1` here. In a row-flex parent (which CardRow's cells are),
// flex-1 expands the *main* axis — it would blow the line out to 20px wide and
// render the whole gutter as a filled strip. `w-px` + default align-items:stretch
// gives us a 1px line that spans the full row height, matching Divider Container.svg.
function VRail() {
  return <span aria-hidden className="block w-px bg-[#dee3e8]" />;
}

/** Top/bottom rail: dot — line — dot — line — dot. */
function RowRail() {
  return (
    <div className="flex w-full items-center gap-2.5">
      <CornerDot />
      <HRail />
      <CornerDot />
      <HRail />
      <CornerDot />
    </div>
  );
}

/* ─── Card row — content flanked by vertical rails + a middle rail.
   Grid template:
     [rail 21px] [card 1fr] [rail 21px] [card 1fr] [rail 21px]
   ─────────────────────────────────────────────────────────── */
function CardRow({
  left,
  right,
}: {
  readonly left: React.ReactNode;
  readonly right: React.ReactNode;
}) {
  return (
    <div className="grid w-full grid-cols-[20px_minmax(0,1fr)_20px_minmax(0,1fr)_20px] items-stretch">
      <div className="flex justify-center">
        <VRail />
      </div>
      <div className="p-5">{left}</div>
      <div className="flex justify-center">
        <VRail />
      </div>
      <div className="p-5">{right}</div>
      <div className="flex justify-center">
        <VRail />
      </div>
    </div>
  );
}

/* ─── SECTION ─────────────────────────────────────────────── */
export default function Problem() {
  const sectionVars = {
    ["--prob-side-mobile" as string]: TUNING.pad.sideMobile,
    ["--prob-side-tablet" as string]: TUNING.pad.sideTablet,
    ["--prob-side-desktop" as string]: TUNING.pad.sideDesktop,
    ["--prob-y-mobile" as string]: TUNING.pad.yMobile,
    ["--prob-y-desktop" as string]: TUNING.pad.yDesktop,
    ["--prob-max" as string]: `${TUNING.maxWidth}px`,
  } as React.CSSProperties;

  return (
    <section
      id="problem"
      aria-labelledby="problem-heading"
      className="relative w-full"
      style={{ background: TUNING.background, ...sectionVars }}
    >
      <div
        className="mx-auto flex w-full flex-col px-[var(--prob-side-mobile)] py-[var(--prob-y-mobile)] sm:px-[var(--prob-side-tablet)] lg:px-[var(--prob-side-desktop)] lg:py-[var(--prob-y-desktop)]"
        style={{ maxWidth: "var(--prob-max)", gap: TUNING.headerToGridGap }}
      >
        {/* Header: eyebrow + heading + description
            Figma: eyebrow 20/28, heading 54/68 medium -2%, description 20/28.
            Column template uses Figma's 526 / 606 widths (instead of 50/50) so
            the heading wraps at the same break as the mock. */}
        <AnimateIn>
          <header className="flex flex-col gap-4">
            <p
              className="m-0"
              style={{
                fontSize: TUNING.type.eyebrow.size,
                lineHeight: TUNING.type.eyebrow.lineHeight,
                color: TUNING.type.eyebrow.color,
              }}
            >
              {COPY.eyebrow}
            </p>
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,526px)_minmax(0,606px)] lg:gap-10">
              <h2
                id="problem-heading"
                className="m-0 font-medium"
                style={{
                  fontSize: TUNING.type.heading.size,
                  lineHeight: TUNING.type.heading.lineHeight,
                  letterSpacing: TUNING.type.heading.tracking,
                  color: TUNING.type.heading.color,
                  maxWidth: TUNING.headerCols.heading,
                }}
              >
                {COPY.heading}
              </h2>
              <p
                className="m-0 lg:pb-2"
                style={{
                  fontSize: TUNING.type.description.size,
                  lineHeight: TUNING.type.description.lineHeight,
                  color: TUNING.type.description.color,
                  maxWidth: TUNING.headerCols.description,
                }}
              >
                {COPY.description}
              </p>
            </div>
          </header>
        </AnimateIn>

        {/* Card grid — mobile stack, desktop 2×2 with rails.
            Per-card stagger: each card has its own IntersectionObserver via
            AnimateIn so the grid cascades in diagonally (TL → TR → BL → BR)
            instead of all four landing simultaneously. 100ms step mirrors the
            Figma motion direction and keeps the whole reveal under 600ms. */}
        {/* Mobile/tablet: simple stack, no rails. Capped at 640px so cards
            don't balloon past the Figma design width when the tablet viewport
            is wide; centred when smaller than the cap. */}
        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-4 lg:hidden">
          <AnimateIn delay={0.15}>
            <ToolsCard />
          </AnimateIn>
          <AnimateIn delay={0.25}>
            <CyclesCard />
          </AnimateIn>
          <AnimateIn delay={0.35}>
            <ScalingCard />
          </AnimateIn>
          <AnimateIn delay={0.45}>
            <TGlobalCard />
          </AnimateIn>
        </div>

        {/* Desktop: Figma-exact grid with corner dots + rails. Rails fade in
            with the first card; cards cascade independently so the motion
            feels anchored to the blueprint frame. */}
        <div className="hidden flex-col lg:flex">
          <AnimateIn delay={0.15}>
            <RowRail />
          </AnimateIn>
          <CardRow
            left={
              <AnimateIn delay={0.15}>
                <ToolsCard />
              </AnimateIn>
            }
            right={
              <AnimateIn delay={0.25}>
                <CyclesCard />
              </AnimateIn>
            }
          />
          <AnimateIn delay={0.3}>
            <RowRail />
          </AnimateIn>
          <CardRow
            left={
              <AnimateIn delay={0.35}>
                <ScalingCard />
              </AnimateIn>
            }
            right={
              <AnimateIn delay={0.45}>
                <TGlobalCard />
              </AnimateIn>
            }
          />
          <AnimateIn delay={0.5}>
            <RowRail />
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
