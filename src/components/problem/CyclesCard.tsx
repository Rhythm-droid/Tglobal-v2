/**
 * Card 2 — "Development cycles take months"
 * ────────────────────────────────────────────────────────────
 * Figma (1440 frame, node 107-21007/21008 → card2):
 *   Card            522 × 261, 12px radius, #ffffff, 24 padding
 *   Copy            same type scale as Card 1 (title 20/26, body 16/20.8)
 *                   capped at 440 so "most of the" wraps to line 2 like Figma
 *   Body row 1      476 × 55.4, rounded-[12.5px], 1px #F2F2F2 border
 *                   "Completion / 60%" label | two progress bars | pink chip
 *   Body row 2      476 × 45.6, same frame, two progress bars behind a 2px
 *                   Gaussian blur — reads as "more work continuing off-frame"
 *   Row gap         6.5px
 *   Bars            8px tall, rounded full; gradient white→#757BFF (indigo)
 *                   and white→#F1B3B3 (pink); widths taken 1:1 from Figma
 *   Pink chip       73 × 6, rx 3, #E8BFF7 (decorative accent top-right of row 1)
 *   Bottom fade     522 × 35 vertical, white 0% → 100% (card-footer.svg)
 *
 * Performance:
 *   Pure server component. Gradient bars are CSS linear-gradients (no SVG),
 *   the "blur" row uses the CSS filter. No client JS, no external assets.
 * ────────────────────────────────────────────────────────────
 */

/* ─── TUNING ───────────────────────────────────────────────── */
const TUNING = {
  card: { minHeight: 261, radius: 12, padding: 24 },
  // Same cap as Card 1 — forces "process is still manual." onto line 2.
  copyMaxWidth: "440px",
  title: { size: "20px", lineHeight: "26px", color: "#2f2b43" },
  body: { size: "16px", lineHeight: "20.8px", color: "#2f2b43b2" },
  row: {
    radius: "12.5px",
    border: "#f2f2f2",
    paddingX: 16,
    paddingY: 10,
    gap: 6,
  },
  bar: {
    height: 8,
    gap: 4,
    indigo: "linear-gradient(90deg, #ffffff 0%, #757bff 100%)",
    pink: "linear-gradient(90deg, #ffffff 0%, #f1b3b3 100%)",
  },
  chip: { width: 73, height: 6, radius: 3, fill: "#e8bff7" },
  completion: {
    label: { size: "10px", lineHeight: "13px", color: "#010101" },
    value: { size: "16px", lineHeight: "20.8px", color: "#010101" },
  },
  bottomFade: {
    height: 35,
    gradient:
      "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)",
  },
} as const;

/* ─── PRIMITIVES ──────────────────────────────────────────── */
type BarHue = "indigo" | "pink";

/**
 * Gradient progress bar. `width` is a CSS length (percent preferred for
 * fluid behaviour) and `maxWidth` caps it at the Figma pixel spec so the
 * desktop rendering is exact.
 */
function Bar({
  hue,
  width,
  maxWidth,
}: {
  readonly hue: BarHue;
  readonly width: string;
  readonly maxWidth: number;
}) {
  return (
    <div
      aria-hidden
      className="rounded-full"
      style={{
        height: TUNING.bar.height,
        width,
        maxWidth,
        background: hue === "indigo" ? TUNING.bar.indigo : TUNING.bar.pink,
      }}
    />
  );
}

/** Shared frame (white fill, 12.5px radius, 1px hairline border) for rows. */
function RowFrame({ children }: { readonly children: React.ReactNode }) {
  return (
    <div
      className="flex w-full items-stretch bg-white"
      style={{
        borderRadius: TUNING.row.radius,
        border: `1px solid ${TUNING.row.border}`,
        paddingInline: TUNING.row.paddingX,
        paddingBlock: TUNING.row.paddingY,
      }}
    >
      {children}
    </div>
  );
}

/* ─── ROW 1 — Completion + bars + chip ─────────────────────── */
function CompletionRow() {
  return (
    <RowFrame>
      {/* Completion / 60% stacked label — held left, top/bottom aligned */}
      <div className="flex shrink-0 flex-col justify-between pr-3">
        <span
          style={{
            fontSize: TUNING.completion.label.size,
            lineHeight: TUNING.completion.label.lineHeight,
            color: TUNING.completion.label.color,
          }}
        >
          Completion
        </span>
        <span
          className="font-bold"
          style={{
            fontSize: TUNING.completion.value.size,
            lineHeight: TUNING.completion.value.lineHeight,
            color: TUNING.completion.value.color,
          }}
        >
          60%
        </span>
      </div>

      {/* Two gradient bars — centred vertically, flex to fill remaining width */}
      <div
        className="flex min-w-0 flex-1 flex-col justify-center"
        style={{ gap: TUNING.bar.gap }}
      >
        <Bar hue="indigo" width="64%" maxWidth={193} />
        <Bar hue="pink" width="40%" maxWidth={121} />
      </div>

      {/* Decorative pink chip on the right */}
      <span
        aria-hidden
        className="ml-3 shrink-0 self-center rounded-full"
        style={{
          width: TUNING.chip.width,
          height: TUNING.chip.height,
          borderRadius: TUNING.chip.radius,
          background: TUNING.chip.fill,
        }}
      />
    </RowFrame>
  );
}

/* ─── ROW 2 — blurred bars only ─────────────────────────────── */
function BlurredRow() {
  return (
    <RowFrame>
      <div
        aria-hidden
        className="flex w-full flex-col justify-center blur-[2px]"
        style={{ gap: TUNING.bar.gap }}
      >
        <Bar hue="indigo" width="67%" maxWidth={296} />
        <Bar hue="pink" width="27%" maxWidth={121} />
      </div>
    </RowFrame>
  );
}

/* ─── CARD ─────────────────────────────────────────────────── */
export default function CyclesCard() {
  return (
    <article
      className="relative flex w-full flex-col overflow-hidden bg-white"
      style={{
        minHeight: TUNING.card.minHeight,
        borderRadius: TUNING.card.radius,
        padding: TUNING.card.padding,
      }}
    >
      {/* Copy block — capped narrower than the card to match Figma wraps */}
      <div
        className="flex flex-col gap-4"
        style={{ maxWidth: TUNING.copyMaxWidth }}
      >
        <h3
          className="m-0 font-medium"
          style={{
            fontSize: TUNING.title.size,
            lineHeight: TUNING.title.lineHeight,
            color: TUNING.title.color,
          }}
        >
          Development cycles take months
        </h3>
        <p
          className="m-0 font-normal"
          style={{
            fontSize: TUNING.body.size,
            lineHeight: TUNING.body.lineHeight,
            color: TUNING.body.color,
          }}
        >
          From writing code to testing and deployment, most of the process is
          still manual.
        </p>
      </div>

      {/* Progress rows — stacked with 6px gap, pushed to the bottom of the card */}
      <div
        className="mt-auto flex w-full flex-col pt-6"
        style={{ gap: TUNING.row.gap }}
      >
        <CompletionRow />
        <BlurredRow />
      </div>

      {/* Bottom fade — matches card-footer.svg (35px, white 0→100%) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{
          height: TUNING.bottomFade.height,
          background: TUNING.bottomFade.gradient,
        }}
      />
    </article>
  );
}
