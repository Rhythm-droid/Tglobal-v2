import { TGlobalNetwork } from "./tglobal-network";

/**
 * Card 4 — "Enters TGlobal"
 * ────────────────────────────────────────────────────────────
 * Figma (1440 frame, node 107-21106 → card4):
 *   Card          522 × 261, 12px radius, purple gradient background
 *   Padding       24 (p-6)
 *   Background    radial gradient #757BFF → white, ellipse ~520×520 centred
 *                 at card (274.7, 130.5) — from card4.svg paint0_radial.
 *                 The visible card only sees the inner ~58% of the gradient,
 *                 so corners read as pale indigo, not white.
 *   Title         "Enters TGlobal", Albert Sans Semibold 32 / 41.6, -2% tracking
 *                 (28 / 36 on mobile so it still breathes at narrow widths)
 *   Illustration  231 × 251 inline SVG (see ./tglobal-network.tsx). Inlined,
 *                 not served as /public/*.svg, so each dot's foreignObject
 *                 backdrop-filter can blur the card's purple gradient behind
 *                 it — loaded via <img> it would render against its own
 *                 transparent canvas and the glassy sheen would disappear.
 *   Mark          "4X >>>>>" Albert Sans Semibold 80 / 80, -1.6px tracking,
 *                 anchored bottom-left, scales down to 56/56 on mobile
 *
 * No bottom fade — the solid gradient is the base. The radial mask inside the
 * SVG handles the illustration's own edge-falloff.
 *
 * Performance:
 *   Pure server component. Illustration is inline SVG (~5KB gzipped of JSX),
 *   zero network requests, zero client JS.
 * ────────────────────────────────────────────────────────────
 */

/* ─── TUNING ───────────────────────────────────────────────── */
const TUNING = {
  card: { minHeight: 261, radius: 12, padding: 24 },
  // Figma spec: radial gradient, #757BFF → white, elliptical basis vectors
  // (a=507.452, b=-96.7, c=193.4, d=487.7) centered at (274.7, 130.5).
  // The ellipse's major/minor axes are both ~520px, so on this 522×261 card
  // the visible color is the inner ~58% of the gradient — bright indigo at
  // centre grading to pale-indigo at the corners.
  background:
    "radial-gradient(ellipse 520px 520px at 274.692px 130.5px, #757bff 0%, #ffffff 100%)",
  illustration: {
    /** Intrinsic aspect ratio — the inline SVG fills its wrapper via
     *  h-full w-full + viewBox, so we only size the wrapper here. */
    aspectRatio: "231 / 251",
    /** Fluid width: min(44% of card, 231px). At ≥1440 cards are ~522 wide
     *  and this caps at Figma's 231. In the 322px grid cells that appear
     *  at the lg breakpoint (1024px viewport) it collapses to ~142 so the
     *  title + 4X mark still have room left of it. */
    fluidWidth: "min(44%, 231px)",
    /** Position from card4.svg's mask (x=261, y=5). Kept in px for a
     *  consistent visual offset from the card corner at every size. */
    right: 30,
    top: 5,
  },
  title: {
    sizeDesktop: "32px",
    lineHeightDesktop: "41.6px",
    sizeMobile: "28px",
    lineHeightMobile: "36px",
    tracking: "-0.02em",
  },
  mark: {
    sizeDesktop: "80px",
    lineHeightDesktop: "80px",
    trackingDesktop: "-1.6px",
    sizeMobile: "56px",
    lineHeightMobile: "56px",
    trackingMobile: "-0.025em",
  },
} as const;

/* ─── CARD ─────────────────────────────────────────────────── */
export default function TGlobalCard() {
  return (
    <article
      className="relative flex w-full flex-col overflow-hidden text-white"
      style={{
        minHeight: TUNING.card.minHeight,
        borderRadius: TUNING.card.radius,
        padding: TUNING.card.padding,
        background: TUNING.background,
      }}
    >
      {/* Illustration — inline SVG so backdrop-filter resolves against the
          card's purple gradient. The pill + network dots sit in the right
          half, naturally anchored to the top-right corner. */}
      <div
        aria-hidden
        className="pointer-events-none absolute select-none"
        style={{
          right: TUNING.illustration.right,
          top: TUNING.illustration.top,
          width: TUNING.illustration.fluidWidth,
          aspectRatio: TUNING.illustration.aspectRatio,
        }}
      >
        <TGlobalNetwork className="h-full w-full" />
      </div>

      {/* Heading — sits above the illustration (z-10) so it stays readable */}
      <h3
        className="relative z-10 m-0 font-semibold sm:text-[32px] sm:leading-[41.6px]"
        style={{
          fontSize: TUNING.title.sizeMobile,
          lineHeight: TUNING.title.lineHeightMobile,
          letterSpacing: TUNING.title.tracking,
        }}
      >
        Enters TGlobal
      </h3>

      {/* "4X >>>>>" decorative mark — anchored bottom-left via mt-auto, scaled
          down on mobile so it doesn't overpower the narrower stacked card */}
      <p
        className="relative z-10 m-0 mt-auto font-semibold sm:text-[80px] sm:leading-[80px] sm:tracking-[-1.6px]"
        style={{
          fontSize: TUNING.mark.sizeMobile,
          lineHeight: TUNING.mark.lineHeightMobile,
          letterSpacing: TUNING.mark.trackingMobile,
        }}
      >
        4X <span aria-hidden>&gt;&gt;&gt;&gt;&gt;</span>
      </p>
    </article>
  );
}
