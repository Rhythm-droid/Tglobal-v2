/**
 * Capabilities Section — Card 5 (middle, diagonal position).
 * Figma: 305 × 220, radial gradient (#757BFF → white) at center with
 * a -15.37° rotation, centered white pixel-T logo.
 *
 * Rendered as inline SVG with a responsive viewBox so it scales
 * proportionally at every breakpoint. `preserveAspectRatio="xMidYMid slice"`
 * ensures the gradient fills the card when its container aspect ratio
 * drifts from 305:220 on small viewports.
 */
export default function TGlogoCard() {
  // Unique gradient ID keeps SVG <defs> from colliding if multiple copies
  // ever render on the same page.
  const gradId = "tg-logo-card-grad";

  return (
    <svg
      className="block h-full w-full"
      viewBox="0 0 305 220"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <radialGradient
          id={gradId}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(160.5 110) rotate(-15.3695) scale(307.497 426.303)"
        >
          <stop stopColor="#757BFF" />
          <stop offset="1" stopColor="#ffffff" />
        </radialGradient>
      </defs>

      {/* Gradient background — 16px radius matches card container */}
      <rect width="305" height="220" rx="16" fill={`url(#${gradId})`} />

      {/* TGlobal pixel-T mark — the white glyph at centre.
          Path is the Figma export verbatim so proportions match pixel-perfect. */}
      <path
        fill="#ffffff"
        d="M115.54 50C116.07 50 116.5 50.4298 116.5 50.96V70.4297C116.941 71.1797 117.435 71.8949 117.955 72.4355C118.502 73.0038 119.224 73.5314 119.985 74H137.151C137.912 73.5314 138.635 73.0038 139.182 72.4355C139.649 71.9495 140.094 71.3211 140.5 70.6543V50.96C140.5 50.4298 140.93 50 141.46 50H211.54C212.07 50 212.5 50.4298 212.5 50.96V73.04C212.5 73.5702 212.07 74 211.54 74H143.037C142.546 74.3176 142.092 74.6476 141.728 74.9814C141.284 75.3873 140.874 75.885 140.5 76.4199V143.192C140.81 143.655 141.135 144.083 141.475 144.436C142.021 145.004 142.744 145.531 143.505 146H187.54C188.07 146 188.5 146.43 188.5 146.96V169.04C188.5 169.57 188.07 170 187.54 170H141.46C140.93 170 140.5 169.57 140.5 169.04V148.935C140.039 148.206 139.513 147.515 138.93 146.981C138.565 146.648 138.112 146.318 137.62 146H117.46C116.93 146 116.5 145.57 116.5 145.04V76.2266C116.163 75.7653 115.799 75.3381 115.409 74.9814C115.044 74.6476 114.591 74.3176 114.1 74H93.46C92.9298 74 92.5 73.5702 92.5 73.04V50.96C92.5 50.4298 92.9298 50 93.46 50H115.54ZM211.54 98C212.07 98 212.5 98.4298 212.5 98.96V121.04C212.5 121.57 212.07 122 211.54 122H189.46C188.93 122 188.5 121.57 188.5 121.04V98.96C188.5 98.4298 188.93 98 189.46 98H211.54Z"
      />
    </svg>
  );
}
