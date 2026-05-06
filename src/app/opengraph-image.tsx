import { ImageResponse } from "next/og";

/**
 * Default OG image — auto-generated 1200×630 PNG that Next.js exposes
 * at /opengraph-image. Used by social platforms (Twitter, LinkedIn,
 * Slack, WhatsApp, iMessage previews, etc.) when the homepage is shared.
 *
 * Brand-fidelity choices (matched to the live site):
 *   • Real LogoMark SVG path (geometric "TGlobal" glyph from Figma).
 *     Inline-rendered via the same path string used in the navbar.
 *   • Wordmark says "tglobal" lowercase semibold to match LogoMark.tsx.
 *   • Headline phrasing matches Hero.tsx exactly: "Software, Without"
 *     on line 1, "the Friction" on line 2.
 *   • Accent highlight color #15131e at 96% opacity matches
 *     ACCENT_HIGHLIGHT_COLOUR in primitives/AccentTypewriter.tsx.
 *   • Accent word "friction" rendered in italic serif (Georgia
 *     fallback for Instrument Serif — see font note below).
 *
 * Font note (intentional limitation):
 *   We use system fonts here, NOT the site's actual Albert Sans /
 *   Instrument Serif. To bundle the real fonts:
 *     1. Download the .ttf files from fonts.google.com.
 *     2. Place under `public/fonts/AlbertSans-SemiBold.ttf` and
 *        `public/fonts/InstrumentSerif-Italic.ttf`.
 *     3. Read with `await readFile(join(process.cwd(), 'public/fonts/...'))`.
 *     4. Pass via the `fonts` option to ImageResponse.
 *   Skipped for now because:
 *     • Social platforms downscale OG images to ~600×315 thumbnails
 *       where geometric sans-serifs read nearly identically.
 *     • Adds 100-300ms to first-build cold start per font.
 *     • Bundling .ttf adds ~80KB per font to the repo.
 *   Easy upgrade if brand fidelity becomes a concern (Phase 2 task).
 *
 * Satori constraints (gotchas vs. browser CSS):
 *   1. Every <div> with more than one child MUST have explicit
 *      `display: flex` (or contents/none).
 *   2. `z-index` is not supported. Use DOM order for stacking.
 *   3. No CSS animations, no media queries, no JS.
 *   4. Subset of CSS properties — no `backdrop-filter`, no `clip-path`.
 */

export const runtime = "nodejs";

export const alt = "TGlobal — Software, without the friction";
export const size = { width: 1200, height: 630 } as const;
export const contentType = "image/png";

/* Brand tokens — keep in sync with src/app/globals.css */
const BRAND = "#4B28FF";
const BRAND_SOFT = "#7358fd";
const INK = "#0A0A14";
const PAPER = "#FFFFFF";
const LAVENDER = "#F6F1FF";
/* Real highlight color from src/components/primitives/AccentTypewriter.tsx */
const ACCENT_HIGHLIGHT = "#15131e";
const ACCENT_HIGHLIGHT_ALPHA = 0.96;

/* Real LogoMark SVG path (from src/components/primitives/LogoMark.tsx).
   Geometric glyph — looks like a stylized inverted "T" inside a frame.
   Replicating verbatim so the OG share preview shows the real brand
   mark, not a placeholder. */
const LOGO_PATH =
  "M7.67969 0C7.85641 5.28913e-06 8 0.143585 8 0.320312V6.80371C8.14783 7.05535 8.31099 7.29724 8.48535 7.47852C8.66843 7.66878 8.91202 7.84328 9.16699 8H14.8789C15.1339 7.84327 15.3775 7.66878 15.5605 7.47852C15.7169 7.31599 15.8643 7.10485 16 6.88184V0.320312C16 0.143581 16.1436 0 16.3203 0H39.6797C39.8564 5.28913e-06 40 0.143585 40 0.320312V7.67969C40 7.85642 39.8564 7.99999 39.6797 8H16.8486C16.684 8.10626 16.5313 8.21542 16.4092 8.32715C16.2613 8.46245 16.1248 8.62834 16 8.80664V31.0596C16.1038 31.2149 16.2114 31.3602 16.3252 31.4785C16.5083 31.6688 16.7519 31.8433 17.0068 32H31.6797C31.8564 32 32 32.1436 32 32.3203V39.6797C32 39.8564 31.8564 40 31.6797 40H16.3203C16.1436 40 16 39.8564 16 39.6797V32.9824C15.8459 32.7386 15.6718 32.5058 15.4766 32.3271C15.3545 32.2154 15.2017 32.1062 15.0371 32H8.32031C8.14358 32 8 31.8564 8 31.6797V8.74121C7.8879 8.58778 7.76643 8.44586 7.63672 8.32715C7.51447 8.21531 7.36112 8.10635 7.19629 8H0.320312C0.143581 8 0 7.85642 0 7.67969V0.320312C0 0.143581 0.143581 0 0.320312 0H7.67969ZM39.6797 16C39.8564 16 40 16.1436 40 16.3203V23.6797C40 23.8564 39.8564 24 39.6797 24H32.3203C32.1436 24 32 23.8564 32 23.6797V16.3203C32 16.1436 32.1436 16 32.3203 16H39.6797Z";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(135deg, ${PAPER} 0%, ${LAVENDER} 100%)`,
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          padding: "72px 80px",
        }}
      >
        {/* Decorative blob — top right, mimics the hero glow */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: 9999,
            background: BRAND,
            filter: "blur(160px)",
            opacity: 0.42,
          }}
        />
        {/* Decorative blob — bottom left, secondary accent */}
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -100,
            width: 360,
            height: 360,
            borderRadius: 9999,
            background: BRAND_SOFT,
            filter: "blur(140px)",
            opacity: 0.28,
          }}
        />

        {/* Top row — REAL brand mark + wordmark.
            The SVG path is the actual LogoMark glyph from the Figma
            export, not a "TG" initials placeholder. */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
          }}
        >
          {/* Logo glyph — color: INK so the geometric mark renders dark
              on the lavender background, matching the navbar treatment. */}
          <svg
            width={64}
            height={64}
            viewBox="0 0 40 40"
            fill="none"
          >
            <path d={LOGO_PATH} fill={INK} />
          </svg>
          {/* Wordmark — "tglobal" lowercase semibold matches LogoMark.tsx
              showWord. Slightly tighter tracking to match the live nav. */}
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 600,
              color: INK,
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            tglobal
          </div>
        </div>

        {/* Headline — matches Hero.tsx phrasing exactly:
            line 1: "Software, Without"
            line 2: "the Friction" (with "Friction" highlighted) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 100,
              fontWeight: 500,
              color: INK,
              letterSpacing: "-0.06em",
              lineHeight: 1.0,
            }}
          >
            <div style={{ display: "flex" }}>Software, Without</div>
            {/* Second line — needs display:flex with two children:
                "the" and the highlighted "Friction" box. */}
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 8 }}>
              <span>the</span>
              {/* Real highlight: #15131e at 96% opacity from
                  AccentTypewriter.tsx ACCENT_HIGHLIGHT_COLOUR. */}
              <div
                style={{
                  display: "flex",
                  background: ACCENT_HIGHLIGHT,
                  /* Satori supports rgba via `background` color directly */
                  color: PAPER,
                  padding: "6px 22px 14px 22px",
                  /* Italic serif accent — Georgia is the closest
                     stable fallback for Instrument Serif (the live
                     site's accent face). Both are humanist serifs
                     with similar italic angles, so the silhouette
                     reads close at OG scale. */
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  letterSpacing: "-0.03em",
                  opacity: ACCENT_HIGHLIGHT_ALPHA,
                }}
              >
                Friction
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row — tagline + URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: INK,
              opacity: 0.7,
              maxWidth: 720,
              lineHeight: 1.35,
            }}
          >
            AI-native engineering. Outcomes per sprint, not hours per week.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 600,
              color: BRAND,
              letterSpacing: "-0.02em",
            }}
          >
            tglobal.in →
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
