import type { ReactNode } from "react";
import AnimateIn from "./primitives/AnimateIn";
import HexEcosystemCard from "./capabilities/HexEcosystemCard";
import TGlogoCard from "./capabilities/TGlogoCard";
import GlassClusterCard from "./capabilities/GlassClusterCard";

/**
 * Section 6 — "Our Capabilities".
 * ────────────────────────────────────────────────────────────────────────────
 *
 *    ┌───────────────────────────────────────────────────┐
 *    │ HOW TO EDIT THIS SECTION:                         │
 *    │                                                   │
 *    │ • Edit card content                               │
 *    │     → ROW_1 / ROW_2 / ROW_3 arrays below          │
 *    │ • Replace an illustration                         │
 *    │     → /public/capabilities/<1|5|9>.svg            │
 *    │ • Tile sizes, paddings, typography, gaps          │
 *    │     → TUNING block                                │
 *    │ • Change grid layout                              │
 *    │     → RowGrid component (grid-template-columns)   │
 *    └───────────────────────────────────────────────────┘
 *
 * Ground truth: Figma capabilities frame (node 107-13249).
 *   Outer canvas         1440 × 900 (white)
 *   Inner card frame     1280 × 700 at (x=80, vertically centered)
 *   Cards                305 × 220  (narrow, illustration)
 *                        467 × 220  (wide, text content)
 *   Radius               16
 *   Gaps                 20 horizontal · 20 vertical
 *   Header (eyebrow/h2)  sits above, centered
 *
 * The NARROW illustration cards form a diagonal:
 *     (1,1) → (2,2) → (3,3)
 * This diagonal pattern means each row needs its own grid-template-columns:
 *     Row 1 : 305  467  467
 *     Row 2 : 467  305  467
 *     Row 3 : 467  467  305
 *
 * Responsive strategy:
 *   ≥lg (1024+) : 3-column diagonal grid, fluid via `fr` units so card
 *                 widths scale proportionally between 1024 and 1440.
 *   <lg         : single-column stack — card order preserved per row.
 *                 Illustration cards keep their 305:220 aspect ratio so
 *                 they don't collapse to zero height in the stack.
 *
 * Reduced motion is handled inside the AnimateIn primitive.
 * ────────────────────────────────────────────────────────────────────────────
 */

/* ════════════════════════════════════════════════════════════════════════════
   TUNING — all px values are AT the 1440 design. clamp() scales them down.
   ════════════════════════════════════════════════════════════════════════════ */
const TUNING = {
  /** Outer section background. Figma: white. */
  background: "#ffffff",

  /** Horizontal inset of the inner frame. Figma: x=80. */
  sidePad: 80,

  /** Card dimensions at ≥lg. */
  cardNarrow: 305, // illustration card width
  cardWide: 467, // text card width
  cardHeight: 220,
  cardRadius: 16,

  /** Grid gaps (both axes). Figma: 20. */
  gridGap: 20,

  /** Typography — eyebrow + heading. Matches Section 7 for consistency. */
  eyebrow: {
    size: "clamp(18px, 2.22vw, 32px)", // 32 / 1440 = 2.22vw
    color: "#404040",
    weight: 400,
  },
  heading: {
    size: "clamp(32px, 4.44vw, 64px)", // 64 / 1440 = 4.44vw
    color: "#000000",
    weight: 500,
  },

  /** Card body typography. */
  cardTitle: {
    size: "clamp(18px, 1.67vw, 24px)", // 24 / 1440 = 1.67vw
    color: "#010101",
    weight: 500,
  },
  cardBody: {
    size: "clamp(13px, 0.97vw, 14px)", // 14 / 1440
    color: "#909090",
    weight: 400,
  },

  /** Vertical rhythm between header and grid. */
  headerToGridGap: "clamp(40px, 4.44vw, 64px)",
  /** Gap between eyebrow and heading. */
  eyebrowToHeadingGap: "clamp(12px, 1.1vw, 16px)",
} as const;

/* ────────────────────────────────────────────────────────────
   Data — rows declared top to bottom.
   `narrow` marks the column index (0/1/2) that holds the illustration
   card on that row — the diagonal pattern emerges when you read them in
   order: 0, 1, 2.
   ──────────────────────────────────────────────────────────── */
type TextCard = {
  readonly kind: "text";
  readonly title: string;
  readonly description: string;
  /** Light = plain white; muted = very soft grey — subtle zebra rhythm. */
  readonly tone: "light" | "muted";
};
type IllustrationSlot = "hex-ecosystem" | "tg-logo" | "glass-cluster";
type IllustrationCard = {
  readonly kind: "illustration";
  readonly slot: IllustrationSlot;
  /** Used as aria-label on the figure — describes what the illustration
   *  represents for screen readers and search crawlers. */
  readonly label: string;
};
type Card = TextCard | IllustrationCard;

type Row = {
  readonly narrowAt: 0 | 1 | 2;
  readonly cards: readonly [Card, Card, Card];
};

const ROW_1: Row = {
  narrowAt: 0,
  cards: [
    {
      kind: "illustration",
      slot: "hex-ecosystem",
      label:
        "Integration ecosystem — OpenAI, Angular, Node.js, AWS, and Google",
    },
    {
      kind: "text",
      title: "Custom ERP Solutions",
      description:
        "We engineer robust Enterprise Resource Planning (ERP) systems designed to serve as the central nervous system of your business.",
      tone: "light",
    },
    {
      kind: "text",
      title: "Scalable CRM Platforms",
      description:
        "Our custom CRM development goes beyond basic lead management to build high-performance engines for customer retention and revenue growth.",
      tone: "muted",
    },
  ],
} as const;

const ROW_2: Row = {
  narrowAt: 1,
  cards: [
    {
      kind: "text",
      title: "Advanced Billing & Revenue Engines",
      description:
        "Financial transparency is the cornerstone of trust, and our custom billing software is built to handle the most intricate revenue models.",
      tone: "muted",
    },
    {
      kind: "illustration",
      slot: "tg-logo",
      label: "TGlobal — unified build platform",
    },
    {
      kind: "text",
      title: "US Healthcare & HIPAA Compliance",
      description:
        "Navigating the digital landscape of US healthcare requires a specialized partner who understands the stakes of data privacy. We provide end-to-end development for healthcare platforms.",
      tone: "light",
    },
  ],
} as const;

const ROW_3: Row = {
  narrowAt: 2,
  cards: [
    {
      kind: "text",
      title: "Smart Stock & Inventory Management",
      description:
        "Our stock management solutions are engineered for precision and real-time visibility across complex supply chains. We build intelligent systems that track inventory lifecycle.",
      tone: "light",
    },
    {
      kind: "text",
      title: "Advanced API Integrations & Middleware",
      description:
        "We specialize in building seamless connectivity between fragmented systems to create a unified data ecosystem. Our expertise lies in developing custom API layers.",
      tone: "muted",
    },
    {
      kind: "illustration",
      slot: "glass-cluster",
      label: "Multi-surface product delivery cluster",
    },
  ],
} as const;

const ROWS: readonly Row[] = [ROW_1, ROW_2, ROW_3] as const;

/* ────────────────────────────────────────────────────────────
   Text card. Renders semantic <article> with real <h3> + <p> so the
   content is crawlable, translatable, and readable by assistive tech.
   ──────────────────────────────────────────────────────────── */
function TextCardView({ card }: { card: TextCard }) {
  const bg = card.tone === "muted" ? "#f6f6f6" : "#ffffff";

  return (
    <article
      className={[
        // Layout
        "flex h-full min-h-[180px] flex-col justify-center",
        "border border-[#f1f1f1] px-8 py-7",
        "lg:min-h-[220px] lg:px-10 lg:py-8",
        // Polish — subtle lift on hover. Translate is GPU-cheap; the
        // shadow stays soft so cards don't feel "buttony".
        "transition-[transform,border-color,box-shadow] duration-300 ease-out",
        "hover:-translate-y-0.5 hover:border-[#e6e6e6]",
        "hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.08)]",
        // Reduced-motion users get the colour change without the lift.
        "motion-reduce:transition-colors motion-reduce:hover:translate-y-0",
        "motion-reduce:hover:shadow-none",
      ].join(" ")}
      style={{
        background: bg,
        borderRadius: `${TUNING.cardRadius}px`,
      }}
    >
      <h3
        className="m-0"
        style={{
          fontSize: TUNING.cardTitle.size,
          color: TUNING.cardTitle.color,
          fontWeight: TUNING.cardTitle.weight,
          lineHeight: 1.15,
          letterSpacing: "-0.045em",
        }}
      >
        {card.title}
      </h3>
      <p
        className="m-0 mt-3 max-w-[340px]"
        style={{
          fontSize: TUNING.cardBody.size,
          color: TUNING.cardBody.color,
          fontWeight: TUNING.cardBody.weight,
          lineHeight: 1.45,
          letterSpacing: "-0.04em",
        }}
      >
        {card.description}
      </p>
    </article>
  );
}

/* ────────────────────────────────────────────────────────────
   Illustration card. Inline SVG React components — no network fetch,
   no raster fallback; scales proportionally at every breakpoint.
   ──────────────────────────────────────────────────────────── */
const ILLUSTRATION_COMPONENTS: Record<IllustrationSlot, () => ReactNode> = {
  "hex-ecosystem": HexEcosystemCard,
  "tg-logo": TGlogoCard,
  "glass-cluster": GlassClusterCard,
};

function IllustrationCardView({ card }: { card: IllustrationCard }) {
  const Illustration = ILLUSTRATION_COMPONENTS[card.slot];
  return (
    <figure
      role="img"
      aria-label={card.label}
      // Below lg the card is a stacked tile and needs an intrinsic
      // height — aspect-ratio gives it the Figma 305:220 proportion.
      // At lg the card's height is driven by the row's tallest sibling
      // (text cards via items-stretch); the SVG inside slices to fill.
      className={[
        "group relative m-0 h-full w-full overflow-hidden",
        // Below lg, cap width to keep the card from ballooning on
        // tablet (~700+ px would otherwise force a 500+ px tall tile).
        // Centered in its grid cell via mx-auto.
        "mx-auto max-w-[420px] aspect-[305/220]",
        "lg:max-w-none lg:mx-0 lg:aspect-auto",
        // Match text-card hover treatment for visual rhythm.
        "transition-transform duration-300 ease-out hover:-translate-y-0.5",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
      ].join(" ")}
      style={{ borderRadius: `${TUNING.cardRadius}px` }}
    >
      <Illustration />
    </figure>
  );
}

/* ────────────────────────────────────────────────────────────
   Row grid. Desktop uses a per-row `grid-template-columns` so the narrow
   column lands at the right position for that row. Below lg it flattens
   to a single column stack.
   ──────────────────────────────────────────────────────────── */
function RowGrid({ row, index }: { row: Row; index: number }) {
  // `fr` units with the Figma's pixel ratios: at exactly 1440 the
  // distribution lands on the original 305 / 467 / 467 widths; below
  // that, cards scale down proportionally instead of overflowing.
  const cols =
    row.narrowAt === 0
      ? `${TUNING.cardNarrow}fr ${TUNING.cardWide}fr ${TUNING.cardWide}fr`
      : row.narrowAt === 1
        ? `${TUNING.cardWide}fr ${TUNING.cardNarrow}fr ${TUNING.cardWide}fr`
        : `${TUNING.cardWide}fr ${TUNING.cardWide}fr ${TUNING.cardNarrow}fr`;

  // Staggered enter — each row animates slightly after the previous.
  const baseDelay = 0.06 + index * 0.08;

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-[var(--cols)]"
      style={
        {
          gap: `${TUNING.gridGap}px`,
          ["--cols" as string]: cols,
        } as React.CSSProperties
      }
    >
      {row.cards.map((card, i) => (
        <AnimateIn key={i} delay={baseDelay + i * 0.05} className="min-w-0">
          {card.kind === "text" ? (
            <TextCardView card={card} />
          ) : (
            <IllustrationCardView card={card} />
          )}
        </AnimateIn>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   SectionHeader — eyebrow + heading, centered.
   ──────────────────────────────────────────────────────────── */
function SectionHeader() {
  return (
    <AnimateIn>
      <div className="flex flex-col items-center gap-[var(--gap)] text-center" style={{ ["--gap" as string]: TUNING.eyebrowToHeadingGap } as React.CSSProperties}>
        <p
          className="m-0"
          style={{
              fontSize: TUNING.eyebrow.size,
            color: TUNING.eyebrow.color,
            fontWeight: TUNING.eyebrow.weight,
            lineHeight: 1,
            letterSpacing: "-0.06em",
          }}
        >
          Our Capabilities
        </p>
        <h2
          id="capabilities-heading"
          className="m-0 max-w-[900px]"
          style={{
              fontSize: TUNING.heading.size,
            color: TUNING.heading.color,
            fontWeight: TUNING.heading.weight,
            lineHeight: 1.1,
            letterSpacing: "-0.06em",
          }}
        >
          Everything You Need to Build, Built In
        </h2>
      </div>
    </AnimateIn>
  );
}

/* ────────────────────────────────────────────────────────────
   SECTION
   ──────────────────────────────────────────────────────────── */
export default function Capabilities(): ReactNode {
  return (
    <section
      id="capabilities"
      aria-labelledby="capabilities-heading"
      className="relative w-full"
      style={{ background: TUNING.background }}
    >
      <div
        className="mx-auto flex w-full max-w-[1440px] flex-col px-6 py-16 sm:px-8 md:py-20 lg:px-[var(--side)] lg:py-[88px]"
        style={
          {
            gap: TUNING.headerToGridGap,
            ["--side" as string]: `${TUNING.sidePad}px`,
          } as React.CSSProperties
        }
      >
        <SectionHeader />

        {/* Card grid — 3 rows, each with its own per-row grid template. */}
        <div className="flex flex-col" style={{ gap: `${TUNING.gridGap}px` }}>
          {ROWS.map((row, i) => (
            <RowGrid key={i} row={row} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
