import {
  AngularLogo,
  AwsLogo,
  BlankLogo,
  ChatGptLogo,
  GoogleLogo,
  NodeJsLogo,
} from "./brand-logos";

/**
 * Card 1 — "Too many tools, not enough clarity"
 * ────────────────────────────────────────────────────────────
 * Figma (1440 frame, node 107-20954 → card1):
 *   Card       522 × 261, 12px radius, #ffffff
 *   Padding    24 (p-6) all sides
 *   Title      Albert Sans Medium 20 / 26, #2f2b43
 *   Body       Albert Sans Regular 16 / 20.8, #2f2b43 @ 70%
 *   Badge row  6 × 62 circular, #EFEFEF, 20px gap
 *   Footer     522 × 74 vertical fade, white 0% → 57.67% → 100%
 *
 * Logos live in ./brand-logos — every badge ships as pure inline SVG, so the
 * whole card is ~8KB of markup and ships zero client JS. See that file for
 * the per-logo geometry notes.
 * ────────────────────────────────────────────────────────────
 */

/* ─── TUNING ───────────────────────────────────────────────── */
const TUNING = {
  card: { minHeight: 261, radius: 12, padding: 24 },
  badgeGap: 20,
  // Figma wraps "tools" to line 2 — the text column is capped well short of
  // the full card width so the description reads tighter than the title.
  // 440px fits "dozens of" on line 1 and forces "tools" to line 2 in Albert
  // Sans 16/20.8.
  copyMaxWidth: "440px",
  title: { size: "20px", lineHeight: "26px", color: "#2f2b43" },
  body: { size: "16px", lineHeight: "20.8px", color: "#2f2b43b2" },
  bottomFade: {
    height: 74,
    gradient:
      "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 57.67%, rgba(255,255,255,1) 100%)",
  },
  rightFade: {
    width: 96,
    gradient:
      "linear-gradient(270deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
  },
} as const;

/* Order matches Figma (node 107-20970): ChatGPT → Angular → Node → AWS → Google → blank */
const LOGOS = [
  ChatGptLogo,
  AngularLogo,
  NodeJsLogo,
  AwsLogo,
  GoogleLogo,
  BlankLogo,
] as const;

/* ─── CARD ─────────────────────────────────────────────────── */
export default function ToolsCard() {
  return (
    <article
      className="relative flex w-full flex-col overflow-hidden bg-white"
      style={{
        minHeight: TUNING.card.minHeight,
        borderRadius: TUNING.card.radius,
        padding: TUNING.card.padding,
      }}
    >
      {/* Copy block — capped narrower than the card so line wraps match Figma */}
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
          Too many tools, not enough clarity
        </h3>
        <p
          className="m-0 font-normal"
          style={{
            fontSize: TUNING.body.size,
            lineHeight: TUNING.body.lineHeight,
            color: TUNING.body.color,
          }}
        >
          Building software today means stitching together dozens of tools —
          design, development, testing, deployment.
        </p>
      </div>

      {/* Logo cluster — spills past the card edge on the right by design */}
      <div
        className="mt-auto flex items-center pt-6"
        style={{ gap: TUNING.badgeGap }}
      >
        {LOGOS.map((Logo, i) => (
          <Logo key={i} />
        ))}
      </div>

      {/* Right-edge wash — softens the final badge clipping past the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0"
        style={{
          width: TUNING.rightFade.width,
          background: TUNING.rightFade.gradient,
        }}
      />

      {/* Bottom fade — matches card1-footer.svg gradient stops exactly */}
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
