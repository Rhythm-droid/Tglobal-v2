import { ImageResponse } from "next/og";

/**
 * /about OG image — auto-served at /about/opengraph-image (Next 16
 * convention). When a /about URL is shared on LinkedIn / Twitter /
 * Slack / etc., this image is what previews.
 *
 * Layout mirrors the homepage OG image's geometry (logo top-left,
 * headline centre, tagline + url bottom row) so the brand share-card
 * silhouette stays consistent across pages. The COPY changes to be
 * /about-specific:
 *   • Headline: "The humans behind the sprints." — matches the H2
 *     in AboutTeam.tsx
 *   • Tagline: founder names so a SERP/social hover reveals the
 *     "small senior team" promise directly in the preview
 *
 * Satori constraints (same as root opengraph-image.tsx):
 *   • Every <div> with multiple children needs display: flex
 *   • No z-index, animations, or media queries
 *   • Subset CSS — no backdrop-filter, no clip-path
 */

export const runtime = "nodejs";

export const alt =
  "TGlobal — The humans behind the sprints. Chandan Gupta, Dhruv Gupta, Rhythm Mittal.";
export const size = { width: 1200, height: 630 } as const;
export const contentType = "image/png";

/* Brand tokens — keep in sync with src/app/globals.css */
const BRAND = "#4B28FF";
const BRAND_SOFT = "#7358fd";
const INK = "#0A0A14";
const PAPER = "#FFFFFF";
const LAVENDER = "#F6F1FF";
const ACCENT_HIGHLIGHT = "#15131e";
const ACCENT_HIGHLIGHT_ALPHA = 0.96;

/* Same LogoMark path as the root OG image. */
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
        {/* Same decorative blobs as the root OG card so the share
            preview reads as "this is a TGlobal page", just with
            different headline copy. */}
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

        {/* Top row — brand mark + page section eyebrow. The eyebrow
            replaces the wordmark to signal "you are on the About
            page, not the homepage" at a glance. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <svg width={56} height={56} viewBox="0 0 40 40" fill="none">
              <path d={LOGO_PATH} fill={INK} />
            </svg>
            <div
              style={{
                display: "flex",
                fontSize: 48,
                fontWeight: 600,
                color: INK,
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              tglobal
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 18,
              fontWeight: 500,
              color: INK,
              opacity: 0.55,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontFamily: "ui-monospace, Menlo, monospace",
            }}
          >
            № 02 — About the team
          </div>
        </div>

        {/* Headline — matches the live page H2 exactly with a
            highlighted accent on "humans" (the editorial word). */}
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
              fontSize: 96,
              fontWeight: 500,
              color: INK,
              letterSpacing: "-0.05em",
              lineHeight: 1.02,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <span>The</span>
              <div
                style={{
                  display: "flex",
                  background: ACCENT_HIGHLIGHT,
                  color: PAPER,
                  padding: "6px 22px 14px 22px",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  letterSpacing: "-0.03em",
                  opacity: ACCENT_HIGHLIGHT_ALPHA,
                }}
              >
                humans
              </div>
            </div>
            <div style={{ display: "flex", marginTop: 8 }}>
              behind the sprints.
            </div>
          </div>
        </div>

        {/* Bottom row — founder names + url. Names act as the
            trust signal at preview scale; even a tiny LinkedIn
            thumbnail reads "Chandan · Dhruv · Rhythm" which is
            a stronger handle than a generic agency tagline. */}
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
              fontSize: 22,
              color: INK,
              opacity: 0.7,
              lineHeight: 1.35,
            }}
          >
            Chandan Gupta · Dhruv Gupta · Rhythm Mittal
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
            tglobal.in/about →
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
