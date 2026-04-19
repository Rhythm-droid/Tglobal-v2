/**
 * Capabilities Section — Card 9 (bottom-right, diagonal position).
 * Figma: 305 × 220 lavender radial gradient card with a 3×3 grid of
 * glass-effect tiles. The center tile is a prominent "product surface"
 * card with a TGlobal mini-mark inside a pink circle.
 *
 * Implementation notes:
 * - Pure inline SVG — no external image, no <foreignObject>.
 * - The Figma source uses `<foreignObject>` + `backdrop-filter: blur()` to
 *   blur the gradient behind each glass tile. On a simple gradient
 *   background the blur is visually indistinguishable from a
 *   semi-transparent fill, so we use `fillOpacity` instead. This renders
 *   consistently in every browser and avoids the known Safari bug with
 *   backdrop-filter inside SVG.
 * - Tiles are positioned so that the TOP row peeks up above the card
 *   (y=-22) and the BOTTOM row peeks down below (y=162). The inner
 *   `clipPath` with curved rounded rect produces the subtle "window"
 *   silhouette — tiles are only visible through that window.
 * - Every `id` is namespaced `gcc-…` so multiple instances of this
 *   component can live on the same page without <defs> collisions.
 */
export default function GlassClusterCard() {
  return (
    <svg
      className="block h-full w-full"
      viewBox="0 0 305 220"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        {/* Lavender radial gradient — Figma paint0_radial_107_13262 */}
        <radialGradient
          id="gcc-bg"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(152.5 110) rotate(90.1209) scale(237.001 328.569)"
        >
          <stop stopColor="#ECCAF9" />
          <stop offset="1" stopColor="#ffffff" />
        </radialGradient>

        {/* Fade-up stroke for the top row of tiles */}
        <linearGradient
          id="gcc-stroke-down"
          x1="40"
          y1="0"
          x2="40"
          y2="80"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E2E2E2" stopOpacity="0" />
          <stop offset="1" stopColor="#E2E2E2" />
        </linearGradient>

        {/* Fade-down stroke for middle/bottom rows */}
        <linearGradient
          id="gcc-stroke-up"
          x1="40"
          y1="80"
          x2="40"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E2E2E2" stopOpacity="0" />
          <stop offset="1" stopColor="#E2E2E2" />
        </linearGradient>

        {/* Center glass container fill — soft top-to-opaque-bottom */}
        <linearGradient
          id="gcc-center-fill"
          x1="152.5"
          y1="66"
          x2="152.5"
          y2="154"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDFDFD" stopOpacity="0.3" />
          <stop offset="1" stopColor="#FDFDFD" />
        </linearGradient>

        {/* Center container border */}
        <linearGradient
          id="gcc-center-border"
          x1="152.5"
          y1="66"
          x2="152.5"
          y2="154"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E2E2E2" />
          <stop offset="1" stopColor="#E2E2E2" stopOpacity="0.75" />
        </linearGradient>

        {/* Inner white-card border */}
        <linearGradient
          id="gcc-white-border"
          x1="152.5"
          y1="70"
          x2="152.5"
          y2="150"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F6F6F6" />
          <stop offset="1" stopColor="#E6E6E6" />
        </linearGradient>

        {/* Clip path — the inner "window" silhouette that limits
            where tiles can show through. Matches Figma's clip1_107_13262. */}
        <clipPath id="gcc-window">
          <path d="M42.5 25.6C42.5 16.64 42.5 12.16 44.24 8.74C45.78 5.73 48.23 3.28 51.24 1.74C54.66 0 59.14 0 68.1 0H236.9C245.86 0 250.34 0 253.76 1.74C256.77 3.28 259.22 5.73 260.76 8.74C262.5 12.16 262.5 16.64 262.5 25.6V194.4C262.5 203.36 262.5 207.84 260.76 211.26C259.22 214.27 256.77 216.72 253.76 218.26C250.34 220 245.86 220 236.9 220H68.1C59.14 220 54.66 220 51.24 218.26C48.23 216.72 45.78 214.27 44.24 211.26C42.5 207.84 42.5 203.36 42.5 194.4V25.6Z" />
        </clipPath>

        {/* Subtle shadow under the center card */}
        <filter
          id="gcc-card-shadow"
          x="90"
          y="60"
          width="125"
          height="125"
          filterUnits="userSpaceOnUse"
        >
          <feOffset dy="3" />
          <feGaussianBlur stdDeviation="3" />
          <feColorMatrix values="0 0 0 0 0.03 0 0 0 0 0.03 0 0 0 0 0.03 0 0 0 0.05 0" />
        </filter>
      </defs>

      {/* Background + outer border */}
      <rect x="0.5" y="0.5" width="304" height="219" rx="15.5" fill="url(#gcc-bg)" />
      <rect x="0.5" y="0.5" width="304" height="219" rx="15.5" fill="none" stroke="#F5F6F8" />

      {/* All content clipped to the inner window silhouette */}
      <g clipPath="url(#gcc-window)">
        {/* Top-center and bottom-center FILLED tiles (peek past the edges) */}
        <rect x="112.5" y="-22" width="80" height="80" rx="12" fill="#FDFDFD" fillOpacity="0.5" />
        <rect x="112.5" y="162" width="80" height="80" rx="12" fill="#FDFDFD" fillOpacity="0.5" />

        {/* 4 corner stroke-only tiles */}
        <rect x="20.875" y="-21.625" width="79.25" height="79.25" rx="11.625" fill="none" stroke="url(#gcc-stroke-down)" strokeWidth="0.75" />
        <rect x="204.875" y="-21.625" width="79.25" height="79.25" rx="11.625" fill="none" stroke="url(#gcc-stroke-down)" strokeWidth="0.75" />
        <rect x="20.875" y="162.375" width="79.25" height="79.25" rx="11.625" fill="none" stroke="url(#gcc-stroke-up)" strokeWidth="0.75" />
        <rect x="204.875" y="162.375" width="79.25" height="79.25" rx="11.625" fill="none" stroke="url(#gcc-stroke-up)" strokeWidth="0.75" />

        {/* 2 middle-side stroke-only tiles */}
        <rect x="20.875" y="70.375" width="79.25" height="79.25" rx="11.625" fill="none" stroke="url(#gcc-stroke-up)" strokeWidth="0.75" />
        <rect x="204.875" y="70.375" width="79.25" height="79.25" rx="11.625" fill="none" stroke="url(#gcc-stroke-up)" strokeWidth="0.75" />

        {/* Center prominent glass card — outer container */}
        <rect x="108.875" y="66.375" width="87.25" height="87.25" rx="19.625" fill="url(#gcc-center-fill)" fillOpacity="0.75" stroke="url(#gcc-center-border)" strokeWidth="0.75" />

        {/* Inner white card with shadow */}
        <rect x="112.5" y="70" width="80" height="80" rx="16" fill="#F1F1F1" filter="url(#gcc-card-shadow)" />
        <rect x="112.875" y="70.375" width="79.25" height="79.25" rx="15.625" fill="none" stroke="url(#gcc-white-border)" strokeWidth="0.75" />

        {/* Pink circle — pulsing highlight around the mini logo */}
        <circle cx="152.5" cy="110" r="19.5" fill="#F4E1FC" />

        {/* Two concentric decorative rings — subtle frosted rings */}
        <rect x="129.875" y="87.375" width="45.25" height="45.25" rx="22.625" fill="none" stroke="#E2E2E2" strokeWidth="0.75" opacity="0.35" />
        <rect x="117.375" y="74.875" width="70.25" height="70.25" rx="35.125" fill="none" stroke="#E2E2E2" strokeWidth="0.75" opacity="0.2" />

        {/* Mini TGlobal logo — Figma export verbatim */}
        <path
          fill="#ffffff"
          d="M145.84 100C145.928 100 146 100.072 146 100.16V103.402C146.074 103.528 146.155 103.649 146.242 103.739C146.334 103.834 146.456 103.922 146.583 104H149.438C149.566 103.922 149.689 103.835 149.78 103.739C149.859 103.658 149.932 103.552 150 103.44V100.16C150 100.072 150.072 100 150.16 100H161.84C161.928 100 162 100.072 162 100.16V103.84C162 103.928 161.928 104 161.84 104H150.424C150.342 104.053 150.265 104.107 150.204 104.163C150.13 104.231 150.063 104.315 150 104.404V115.529C150.052 115.607 150.105 115.68 150.162 115.739C150.254 115.835 150.376 115.922 150.504 116H157.84C157.928 116 158 116.072 158 116.16V119.84C158 119.928 157.928 120 157.84 120H150.16C150.072 120 150 119.928 150 119.84V116.491C149.923 116.369 149.836 116.252 149.738 116.163C149.677 116.107 149.601 116.053 149.519 116H146.16C146.072 116 146 115.928 146 115.84V104.375C145.943 104.297 145.883 104.223 145.817 104.163C145.756 104.107 145.681 104.053 145.599 104H142.16C142.072 104 142 103.928 142 103.84V100.16C142 100.072 142.072 100 142.16 100H145.84ZM161.84 108C161.928 108 162 108.072 162 108.16V111.84C162 111.928 161.928 112 161.84 112H158.16C158.072 112 158 111.928 158 111.84V108.16C158 108.072 158.072 108 158.16 108H161.84Z"
        />

        {/* Dust particles — atmospheric detail scattered around the card */}
        <circle cx="227" cy="27" r="4" fill="#EDEDED" />
        <circle cx="60.25" cy="40.75" r="1.25" fill="#D8D8D8" />
        <circle cx="60.5" cy="156.5" r="2" fill="#DEDEDE" />
        <circle cx="240.5" cy="180" r="2" fill="#DEDEDE" />
        <circle cx="246.5" cy="27.5" r="1" fill="#D8D8D8" />
        <circle cx="233" cy="151.5" r="1" fill="#D8D8D8" />
        <circle cx="78" cy="79.5" r="2" fill="#DEDEDE" />

        {/* Connector lines (drop-down from top, drop-up from bottom) */}
        <path d="M152.5 0L152.5 42" stroke="#D9D9D9" strokeWidth="0.75" strokeLinecap="round" />
        <path d="M148.5 42H156.5" stroke="#D9D9D9" strokeWidth="0.75" strokeLinecap="round" />
        <path d="M152.5 220L152.5 178" stroke="#D9D9D9" strokeWidth="0.75" strokeLinecap="round" />
        <path d="M148.5 178H156.5" stroke="#D9D9D9" strokeWidth="0.75" strokeLinecap="round" />
      </g>

      {/* Re-assert border on top so clipped children never paint over it */}
      <rect x="0.5" y="0.5" width="304" height="219" rx="15.5" fill="none" stroke="#F5F6F8" />
    </svg>
  );
}
