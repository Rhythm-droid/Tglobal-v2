/**
 * Card 3 — "Scaling introduces complexity"
 * ────────────────────────────────────────────────────────────
 * Figma (1440 frame, node 107-21046 → card3):
 *   Card            522 × 261, 12px radius, #ffffff, 24 padding
 *   Copy            same type scale as Card 1 / 2. Capped at 200 so the
 *                   title wraps "Scaling introduces" / "complexity" and the
 *                   body wraps "...they" / "become harder to maintain." —
 *                   matches the Figma line breaks.
 *   Illustration    283 × 215 vector — anchored bottom-right. Shows a
 *                   central purple "source" button fanning out to two
 *                   service chips and a window of live tasks. Pure vector
 *                   (no raster inside), served from /public/problem/scaling.svg
 *                   and lazy-loaded by the browser.
 *   Footer          522 × 38 vertical fade, white 0% → 57.67% → 100%
 *                   (card3-footer.svg — same 3-stop shape as Card 1's fade,
 *                   just shorter)
 *
 * Performance:
 *   Pure server component. The illustration is a single lazy-loaded SVG
 *   request (~7KB over the wire after gzip); the card itself ships zero
 *   client JS.
 * ────────────────────────────────────────────────────────────
 */

/* ─── TUNING ───────────────────────────────────────────────── */
const TUNING = {
  card: { minHeight: 261, radius: 12, padding: 24 },
  // Figma "Text Container" frame is Fixed 181px, but that's the design-mode
  // bound — the text itself is allowed to overflow the frame in Figma.
  // Browser Albert Sans at 16/20.8 renders "become harder to maintain." at
  // ~187px, so 181 wraps it to 3 lines while Figma shows 2. 190 fits the
  // full line, matches Figma's visual wrap, and still leaves ~1px before the
  // illustration starts.
  copyMaxWidth: "190px",
  title: { size: "20px", lineHeight: "26px", color: "#2f2b43" },
  body: { size: "16px", lineHeight: "20.8px", color: "#2f2b43b2" },
  illustration: {
    src: "/problem/scaling.svg",
    /** intrinsic dimensions (for aspect ratio / CLS reservation) */
    width: 283,
    height: 215,
    /** Fluid render size: min(53% of card, 283px). At the Figma target
     *  (~522px cards) this lands at 283; inside the 322px-wide grid cells
     *  that show up at the lg breakpoint (1024px viewport), it shrinks to
     *  ~170px so it doesn't crowd the copy column. */
    fluidWidth: "min(53%, 283px)",
    /** inset from the card's right + bottom edges (matches p-6 padding) */
    inset: 24,
  },
  bottomFade: {
    height: 38,
    gradient:
      "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 57.67%, rgba(255,255,255,1) 100%)",
  },
} as const;

/* ─── CARD ─────────────────────────────────────────────────── */
export default function ScalingCard() {
  return (
    <article
      className="relative flex w-full flex-col overflow-hidden bg-white"
      style={{
        minHeight: TUNING.card.minHeight,
        borderRadius: TUNING.card.radius,
        padding: TUNING.card.padding,
      }}
    >
      {/* Copy block — narrow column on the left */}
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
          Scaling introduces complexity
        </h3>
        <p
          className="m-0 font-normal"
          style={{
            fontSize: TUNING.body.size,
            lineHeight: TUNING.body.lineHeight,
            color: TUNING.body.color,
          }}
        >
          As systems evolve, they become harder to maintain.
        </p>
      </div>

      {/* Illustration — absolute so it doesn't push the copy block out of the
          card. Hidden below sm where the narrow stacked layout leaves no room
          for it to sit next to the text. */}
      {/* eslint-disable-next-line @next/next/no-img-element
          ── this is a decorative static vector; using next/image adds no value
             for SVG and would require dangerouslyAllowSvg in next.config */}
      <img
        src={TUNING.illustration.src}
        alt=""
        width={TUNING.illustration.width}
        height={TUNING.illustration.height}
        loading="lazy"
        draggable={false}
        className="pointer-events-none absolute hidden select-none sm:block"
        style={{
          right: TUNING.illustration.inset,
          bottom: TUNING.illustration.inset,
          width: TUNING.illustration.fluidWidth,
          height: "auto",
        }}
      />

      {/* Bottom fade — matches card3-footer.svg (38px, 3-stop white gradient) */}
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
