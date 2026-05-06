import { ImageResponse } from "next/og";

/**
 * Default OG image — auto-generated 1200×630 PNG that Next.js exposes
 * at /opengraph-image. Used by social platforms (Twitter, LinkedIn,
 * Slack, WhatsApp, iMessage previews, etc.) when the homepage is shared.
 *
 * Why generate, not ship a static PNG:
 *   • Brand text/colors live in code, so updates don't require a
 *     designer round-trip.
 *   • Per-page variants (e.g. case study covers) reuse the same
 *     <Image> primitive with different copy.
 *   • next/og uses Satori under the hood — sub-second cold start,
 *     statically cached after first request.
 *
 * Satori constraints (gotchas vs. browser CSS):
 *   1. Every <div> with more than one child MUST have explicit
 *      `display: flex` (or contents/none). Browser default `block`
 *      with multiple children throws an error.
 *   2. `z-index` is not supported. Use DOM order for stacking
 *      (later siblings paint on top of earlier ones) or `position`
 *      with absolute positioning.
 *   3. No CSS animations, no media queries, no JS. Pure layout + paint.
 *   4. Subset of CSS properties — no `backdrop-filter`, no `clip-path`,
 *      limited `filter` support. `blur()` works for decoration.
 *
 * Font strategy:
 *   We deliberately use system sans-serif here (no Google Fonts fetch).
 *   Reasons:
 *     1. Build speed — fetching the font adds 1–3s to every cold start.
 *     2. Reliability — Google Fonts CDN occasionally rate-limits
 *        ImageResponse calls.
 *     3. Visual difference is minor at OG scale — the 1200×630 PNG is
 *        usually downscaled by social platforms to ~600×315 thumbnail.
 *   If brand purity matters more than build speed later, swap in
 *   Albert Sans by fetching the .ttf and passing via the `fonts` option.
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
        {/* Decorative blob — top right, mimics the hero glow.
            Single-child div doesn't need display:flex. */}
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
            opacity: 0.45,
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

        {/* Top row — wordmark.
            display:flex required (two children: glyph + name). */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          {/* Brand glyph — 56×56 rounded square with "TG".
              display:flex needed even for single text child to use
              alignItems/justifyContent. */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: INK,
              color: PAPER,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "-0.04em",
            }}
          >
            TG
          </div>
          {/* Single-child text element — display:flex still required
              because Satori treats <span> with text as multi-child. */}
          <div
            style={{
              display: "flex",
              fontSize: 32,
              fontWeight: 600,
              color: INK,
              letterSpacing: "-0.04em",
            }}
          >
            TGlobal
          </div>
        </div>

        {/* Headline — fills the middle.
            display:flex column to stack text rows. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {/* The headline itself. Satori needs each line as its own
              flex container because there are inline children (the
              highlighted "friction" span). Splitting into three rows
              avoids the multi-child-without-flex error and gives us
              precise control over the highlight box. */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 96,
              fontWeight: 600,
              color: INK,
              letterSpacing: "-0.05em",
              lineHeight: 1.05,
              maxWidth: 980,
            }}
          >
            <div style={{ display: "flex" }}>Software,</div>
            {/* Second line — needs display:flex with two children: text + highlight. */}
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <span>without the</span>
              <div
                style={{
                  display: "flex",
                  background: INK,
                  color: PAPER,
                  padding: "4px 18px 8px 18px",
                  fontStyle: "italic",
                  fontWeight: 500,
                  letterSpacing: "-0.03em",
                }}
              >
                friction
              </div>
              <span>.</span>
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
