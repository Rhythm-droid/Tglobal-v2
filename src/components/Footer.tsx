/**
 * Footer — Section 9.
 * ────────────────────────────────────────────────────────────────────────────
 *
 *    ┌─────────────────────────────────────────┐
 *    │ HOW TO EDIT THIS FOOTER:                │
 *    │                                         │
 *    │ • Text content         → FOOTER_CONTENT │
 *    │ • Link destinations    → FOOTER_CONTENT │
 *    │ • Quick Link columns   → FOOTER_CONTENT │
 *    │ • Support links        → FOOTER_CONTENT │
 *    │ • Social icons/URLs    → FOOTER_CONTENT │
 *    │ • Brand tagline        → FOOTER_CONTENT │
 *    │ • Giant wordmark       → FOOTER_CONTENT │
 *    │ • Copyright text       → FOOTER_CONTENT │
 *    │                                         │
 *    │ Visual / layout changes:                │
 *    │ • Logo SVG             → <BrandMark />  │
 *    │ • Social icon paths    → <InstagramIcon />, <LinkedInIcon /> │
 *    │ • Ambient glow         → <GlowBackground /> │
 *    │ • Giant text styling   → <GiantWordmark /> │
 *    └─────────────────────────────────────────┘
 *
 * Responsive strategy:
 *   Mobile (<640):  single column stack, padding px-6, big text ~100px.
 *   Small (640+):   3-col links grid (brand still stacks on top).
 *   Desktop (1024+): Figma's absolute layout — brand 291px fixed, 1280 inner
 *                    width content row at top=60, divider at top=300, big
 *                    wordmark at top=368 (Figma's filter3_i.y exact).
 *
 *   The CARD (gradient bg + rounded top corners) fills the viewport at any
 *   width — NOT capped to 1440 — so the curved background extends edge-to-edge
 *   on ultrawide displays. Only the INNER CONTENT is capped at 1280/1320.
 *
 * Ground truth:
 *   design/Site_design_breakdown_into_sections/9-Fotter/*  (Anima export)
 *   Downloads/figma/BG.svg                                  (exact polygon paths)
 *   Downloads/figma/Desktop - 6.svg                         (exact text position)
 */

import Link from "next/link";

/* ════════════════════════════════════════════════════════════════════════════
   TWEAK ZONES — all the common knobs, in one place. Everything else in this
   file is structural; if you only want to reposition or resize something,
   change a value here.
   ════════════════════════════════════════════════════════════════════════════

   (A) GIANT "TGLOBAL" WORDMARK POSITION & SIZE
       Component: <GiantWordmark />
       File region: search for `function GiantWordmark`.
       Knobs:
         fontSize: "clamp(64px, 27.5vw, 394px)"
           └── 64px  = min size on mobile          ← raise to push mobile larger
           └── 27.5vw = fluid middle (scales w/ viewport)
           └── 394px = max size (Figma spec @ 1440vw)
         lineHeight: 1.1                ← tighten/loosen vertical spacing
         top: "calc(100% - 0.805em)"    ← raise/lower the text within the card
           └── 0.805em ≈ 80.5% of cap-height from bottom
           └── increase → text moves UP    (less visible / more clipped)
           └── decrease → text moves DOWN  (more visible / less clipped)
         textShadow: "0px -5px 30px rgba(255,255,255,0.4)"
           └── outer glow from top edge

   (B) CARD DIMENSIONS (rounded background container)
       In the main Footer() return, on the inner <div> with bg-gradient:
         rounded-t-[32px]       ← mobile/tablet corner radius
         lg:rounded-t-[48px]    ← desktop corner radius (Figma: 48)
         lg:h-[685px]           ← desktop fixed height (Figma: 685)

   (C) DESKTOP CONTENT POSITIONS (≥1024px only)
       Content row:   lg:top-[60px]  lg:w-[1280px]      ← Figma: 60 / 1280
       Brand column:  lg:w-[291px]                      ← Figma: 291
       Divider row:   lg:top-[300px] lg:w-[1320px]      ← Figma: 300 / 1320

   (D) MOBILE/TABLET PADDING & SPACING
       px-6             ← horizontal padding at <640 (24px)
       sm:px-10         ← horizontal padding at ≥640 (40px)
       pt-10            ← top padding
       pb-[180px]       ← bottom padding (reserves space for TGlobal text)
       sm:pb-[220px]    ← bottom padding at ≥640
       mt-12            ← gap between content and divider

   (E) COLORS (all #4B28FF purple in Figma)
       Brand purple:    #4B28FF          (social icons, divider, hover states)
       Body copy:       #4B5563 (gray-600)
       Headings:        black
       Copyright:       #18181B (zinc-900)
       Card bg:         linear-gradient #FAF9F8 → #FFFFFF

   (F) SOCIAL ICON HOVER STATE
       Default: outlined purple ring around a brand-purple icon.
       Hover/focus: solid purple bg + white icon (ring fades out, the
       <a>'s `hover:bg-[#4B28FF]` provides the disc).
       Change via `hover:bg-[#4B28FF] hover:text-white` in each icon's <a>.
       Only Instagram and LinkedIn are surfaced — see InstagramIcon /
       LinkedInIcon. Both render as external links (target=_blank,
       rel=noopener noreferrer).
   ════════════════════════════════════════════════════════════════════════════
*/

/* ────────────────────────────────────────────────────────────
   CONFIG — edit anything below to change footer content
   ──────────────────────────────────────────────────────────── */
const FOOTER_CONTENT = {
  /* Tagline mirrors the rest of the site's positioning — outcomes per
     sprint, AI-native engineering, no membership / SaaS framing. The
     previous "this membership will help you…" line was placeholder
     copy and didn't match TGlobal's actual product. */
  tagline: "AI-native engineering. Outcomes per sprint, not hours per week.",
  /* Quick Link columns — sourced from src/app/page.tsx section order +
     Navbar.tsx anchors. Split across two sub-columns purely for layout
     balance (4 / 3); the LOGICAL order across both columns must match
     scroll order so users mentally map "footer link → page position".
     Anchors (in scroll order):
       #top          → Hero            (scroll to top)
       #problem      → Problem
       #how-it-works → HowItWorks
       #services     → Services
       #capabilities → Capabilities
       #our-work     → Clients (Projects)
       #talk-to-us   → CTA (Contact Us)
       #faq          → Faq             (now after CTA — see page.tsx)
     If a section is added/removed/renamed in page.tsx, mirror it here. */
  quickLinkColumns: [
    [
      { label: "Home", href: "#top" },
      { label: "Problem", href: "#problem" },
      { label: "How it Works", href: "#how-it-works" },
      { label: "Services", href: "#services" },
    ],
    [
      { label: "Capabilities", href: "#capabilities" },
      { label: "Projects", href: "#our-work" },
      { label: "Contact Us", href: "#talk-to-us" },
    ],
  ],
  supportLinks: [
    { label: "FAQ'S", href: "#faq" },
    /* Privacy is a real route (src/app/privacy/page.tsx), not an
       in-page anchor — distinct from FAQ which lives in the page
       body. The link helper below detects "/" prefixes and renders
       a Next.js <Link> so navigation is client-side / SPA-fast. */
    { label: "Privacy Policy", href: "/privacy" },
    /* Contact Us routes to the CTA section so the user is taken straight
       to the "talk to us" form. Same anchor as Quick Link → Contact Us
       and Navbar's trailing pill. */
    { label: "Contact Us", href: "#talk-to-us" },
  ],
  /* Only Instagram and LinkedIn are surfaced now. Both are external
     destinations, so the icon components add `target="_blank"` and
     `rel="noopener noreferrer"`. If you need to add or remove a network,
     update this object AND the matching icon render block below. */
  socialLinks: {
    instagram: "https://www.instagram.com/tglobal_ai",
    linkedin: "https://www.linkedin.com/company/tglobal-digital/",
  },
  copyright: "Copyright © 2025. All Rights Reserved",
  giantWordmark: "TGlobal", // Capital T+G per latest direction; Figma path was lowercase
} as const;

/* ────────────────────────────────────────────────────────────
   Smart link helper — picks Next.js Link for internal routes
   ("/privacy", "/terms", etc.) and a plain <a> for in-page
   anchors ("#talk-to-us", "#problem"). Anchors must stay as
   plain <a> so Lenis (smooth scroll) intercepts the click and
   animates; routing them through Next.js Link would trigger a
   route change instead of a scroll.
   ──────────────────────────────────────────────────────────── */
function FooterLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

/* ────────────────────────────────────────────────────────────
   Brand mark — "TC" glyph + lowercase "tglobal" wordmark
   Exact SVG paths from Anima export (do not edit paths by hand).
   ──────────────────────────────────────────────────────────── */
function BrandMark() {
  return (
    <a
      href="#top"
      aria-label="TGlobal home"
      className="inline-flex items-center gap-[5.44px]"
    >
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
        <path
          d="M7.67969 0C7.85641 5.28913e-06 8 0.143585 8 0.320312V6.80371C8.14783 7.05535 8.31099 7.29724 8.48535 7.47852C8.66843 7.66878 8.91202 7.84328 9.16699 8H14.8789C15.1339 7.84327 15.3775 7.66878 15.5605 7.47852C15.7169 7.31599 15.8643 7.10485 16 6.88184V0.320312C16 0.143581 16.1436 0 16.3203 0H39.6797C39.8564 5.28913e-06 40 0.143585 40 0.320312V7.67969C40 7.85642 39.8564 7.99999 39.6797 8H16.8486C16.684 8.10626 16.5313 8.21542 16.4092 8.32715C16.2613 8.46245 16.1248 8.62834 16 8.80664V31.0596C16.1038 31.2149 16.2114 31.3602 16.3252 31.4785C16.5083 31.6688 16.7519 31.8433 17.0068 32H31.6797C31.8564 32 32 32.1436 32 32.3203V39.6797C32 39.8564 31.8564 40 31.6797 40H16.3203C16.1436 40 16 39.8564 16 39.6797V32.9824C15.8459 32.7386 15.6718 32.5058 15.4766 32.3271C15.3545 32.2154 15.2017 32.1062 15.0371 32H8.32031C8.14358 32 8 31.8564 8 31.6797V8.74121C7.8879 8.58778 7.76643 8.44586 7.63672 8.32715C7.51447 8.21531 7.36112 8.10635 7.19629 8H0.320312C0.143581 8 0 7.85642 0 7.67969V0.320312C0 0.143581 0.143581 0 0.320312 0H7.67969ZM39.6797 16C39.8564 16 40 16.1436 40 16.3203V23.6797C40 23.8564 39.8564 24 39.6797 24H32.3203C32.1436 24 32 23.8564 32 23.6797V16.3203C32 16.1436 32.1436 16 32.3203 16H39.6797Z"
          fill="#010101"
        />
      </svg>
      <svg width="116" height="40" viewBox="0 0 116 40" fill="none" aria-hidden>
        <path
          d="M3.26087 9.56522V3.47826H6.52174V9.56522H12.3043V12.6087H6.52174V24.3043C6.52174 25.6377 6.7971 26.6087 7.34783 27.2174C7.92754 27.8261 8.65217 28.1884 9.52174 28.3043C10.4203 28.4203 11.3478 28.4203 12.3043 28.3043V31.1304C11.1739 31.3913 10.058 31.4638 8.95652 31.3478C7.88406 31.2319 6.91304 30.913 6.04348 30.3913C5.2029 29.8406 4.52174 29.0725 4 28.087C3.50725 27.1014 3.26087 25.8406 3.26087 24.3043V12.6087H0V9.56522H3.26087Z"
          fill="#010101"
        />
        <path
          d="M31.2418 9.56522H34.2418V27.3043C34.2418 29.971 33.6476 32.2464 32.4592 34.1304C31.2708 36.0435 29.5462 37.4928 27.2853 38.4783C25.0245 39.4928 22.2708 40 19.0245 40L18.5027 37C22.5897 36.942 25.6911 36.087 27.8071 34.4348C29.923 32.8116 30.981 30.4348 30.981 27.3043V26.8261L31.3288 26.913C30.6621 28.1884 29.6621 29.2899 28.3288 30.2174C26.9955 31.1159 25.2708 31.5797 23.1549 31.6087C21.1549 31.6087 19.4013 31.1594 17.894 30.2609C16.4158 29.3333 15.2563 28.029 14.4158 26.3478C13.6042 24.6667 13.1984 22.6957 13.1984 20.4348C13.1984 18.1739 13.6042 16.2174 14.4158 14.5652C15.2563 12.8841 16.4158 11.5797 17.894 10.6522C19.4013 9.72464 21.1549 9.26087 23.1549 9.26087C24.4592 9.26087 25.6187 9.46377 26.6332 9.86957C27.6476 10.2464 28.5172 10.7681 29.2418 11.4348C29.9665 12.0725 30.5607 12.7971 31.0245 13.6087L31.2418 9.56522ZM16.7201 20.4348C16.7201 22.9275 17.3578 24.913 18.6332 26.3913C19.9375 27.8406 21.6911 28.5652 23.894 28.5652C25.2274 28.5652 26.4303 28.2464 27.5027 27.6087C28.5752 26.971 29.4158 26.0435 30.0245 24.8261C30.6621 23.6087 30.981 22.1449 30.981 20.4348C30.981 18.7246 30.6621 17.2754 30.0245 16.087C29.4158 14.8696 28.5752 13.942 27.5027 13.3043C26.4303 12.6377 25.2274 12.3043 23.894 12.3043C21.7201 12.3043 19.981 13.0435 18.6766 14.5217C17.3723 16 16.7201 17.971 16.7201 20.4348Z"
          fill="#010101"
        />
        <path d="M38.3047 0H41.5656V31.3043H38.3047V0Z" fill="#010101" />
        <path
          d="M54.9803 31.6087C52.9223 31.6087 51.0817 31.1594 49.4586 30.2609C47.8354 29.3623 46.56 28.087 45.6325 26.4348C44.7049 24.7536 44.2412 22.7681 44.2412 20.4783C44.2412 18.1594 44.7049 16.1594 45.6325 14.4783C46.589 12.7971 47.8788 11.5072 49.502 10.6087C51.1542 9.71014 53.0093 9.26087 55.0673 9.26087C57.1252 9.26087 58.9658 9.71014 60.589 10.6087C62.2412 11.5072 63.531 12.7971 64.4586 14.4783C65.4151 16.1304 65.8933 18.1014 65.8933 20.3913C65.8933 22.7101 65.4151 24.7101 64.4586 26.3913C63.502 28.0725 62.1977 29.3623 60.5455 30.2609C58.8933 31.1594 57.0383 31.6087 54.9803 31.6087ZM54.9368 28.5217C56.2122 28.5217 57.4151 28.2464 58.5455 27.6957C59.676 27.1159 60.589 26.2319 61.2846 25.0435C62.0093 23.8261 62.3716 22.2899 62.3716 20.4348C62.3716 18.5507 62.0238 17.0145 61.3281 15.8261C60.6325 14.6377 59.7194 13.7681 58.589 13.2174C57.4875 12.6377 56.2991 12.3478 55.0238 12.3478C53.7484 12.3478 52.56 12.6377 51.4586 13.2174C50.3571 13.7681 49.4586 14.6522 48.7629 15.8696C48.0962 17.058 47.7629 18.5797 47.7629 20.4348C47.7629 22.3188 48.0962 23.8551 48.7629 25.0435C49.4296 26.2319 50.2991 27.1159 51.3716 27.6957C52.473 28.2464 53.6615 28.5217 54.9368 28.5217Z"
          fill="#010101"
        />
        <path
          d="M71.5387 13.9565C72.1764 12.6232 73.1764 11.5072 74.5387 10.6087C75.901 9.71014 77.6257 9.26087 79.7126 9.26087C81.7126 9.26087 83.4518 9.72464 84.93 10.6522C86.4373 11.5797 87.5967 12.8841 88.4083 14.5652C89.2489 16.2174 89.6692 18.1739 89.6692 20.4348C89.6692 22.6957 89.2489 24.6667 88.4083 26.3478C87.5677 28.029 86.3938 29.3333 84.8866 30.2609C83.4083 31.1594 81.6836 31.6087 79.7126 31.6087C77.7416 31.6087 76.1039 31.1884 74.7996 30.3478C73.4952 29.5072 72.5097 28.4783 71.8431 27.2609L71.6257 31.3043H68.6257V0H71.8865V14L71.5387 13.9565ZM86.1474 20.4348C86.1474 17.942 85.4952 15.971 84.1909 14.5217C82.9155 13.0435 81.1909 12.3043 79.017 12.3043C77.6547 12.3043 76.4228 12.6377 75.3213 13.3043C74.2489 13.942 73.4083 14.8696 72.7996 16.087C72.1909 17.2754 71.8865 18.7246 71.8865 20.4348C71.8865 22.1449 72.1909 23.6087 72.7996 24.8261C73.4083 26.0435 74.2489 26.971 75.3213 27.6087C76.4228 28.2464 77.6547 28.5652 79.017 28.5652C81.1909 28.5652 82.9155 27.8406 84.1909 26.3913C85.4952 24.913 86.1474 22.9275 86.1474 20.4348Z"
          fill="#010101"
        />
        <path
          d="M105.993 31.3043L105.732 27.3913C105.123 28.7246 104.225 29.7681 103.036 30.5217C101.848 31.2464 100.341 31.6087 98.5146 31.6087C96.9494 31.6087 95.6161 31.3623 94.5146 30.8696C93.4131 30.3768 92.5581 29.6812 91.9494 28.7826C91.3697 27.8551 91.0798 26.7681 91.0798 25.5217C91.0798 23.6957 91.761 22.2029 93.1233 21.0435C94.4856 19.8551 96.4566 19.1304 99.0363 18.8696L105.732 18.1304V16.3913C105.732 15.1739 105.283 14.2029 104.384 13.4783C103.486 12.7246 102.268 12.3478 100.732 12.3478C99.2247 12.3478 97.9639 12.6957 96.9494 13.3913C95.9639 14.087 95.2827 15.087 94.9059 16.3913L91.9494 15.3478C92.5291 13.4348 93.5871 11.942 95.1233 10.8696C96.6885 9.7971 98.5871 9.26087 100.819 9.26087C103.399 9.26087 105.399 9.92754 106.819 11.2609C108.268 12.5652 108.993 14.3478 108.993 16.6087V31.3043H105.993ZM105.732 20.913L98.9929 21.6957C97.5436 21.8696 96.4421 22.2754 95.6885 22.913C94.9349 23.5217 94.5581 24.3333 94.5581 25.3478C94.5581 26.3623 94.9204 27.1739 95.645 27.7826C96.3987 28.3913 97.4711 28.6957 98.8624 28.6957C100.457 28.6957 101.761 28.3768 102.775 27.7391C103.79 27.1014 104.529 26.2464 104.993 25.1739C105.486 24.0725 105.732 22.8841 105.732 21.6087V20.913Z"
          fill="#010101"
        />
        <path d="M112.746 0H116.007V31.3043H112.746V0Z" fill="#010101" />
      </svg>
    </a>
  );
}

/* ────────────────────────────────────────────────────────────
   Social icons (exact SVG paths from Anima export)
   ──────────────────────────────────────────────────────────── */
/**
 * Social icons — Instagram and LinkedIn share the same hover pattern:
 *   Default state: outlined ring with the brand purple icon.
 *   Hover/focus state: solid #4B28FF background with a WHITE icon —
 *   matches the reference screenshot.
 *
 * Implementation notes:
 *   - Both icons use `currentColor` on their SVG paths so a single
 *     `text-[#4B28FF] group-hover:text-white` class flips the icon
 *     colour. The outer stroked <rect> ring fades out on hover; the
 *     <a>'s `hover:bg-[#4B28FF]` provides the filled disc underneath.
 *   - `group` + `group-hover` drives everything from the <a> wrapper.
 *   - Both destinations are external; we add `target="_blank"` and
 *     `rel="noopener noreferrer"` for security (noopener prevents the
 *     destination from accessing window.opener) and to match user
 *     expectation that brand profiles open in a new tab.
 */
function InstagramIcon({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram"
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[#4B28FF] transition-colors duration-200 hover:bg-[#4B28FF] hover:text-white focus-visible:bg-[#4B28FF] focus-visible:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4B28FF]"
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden
        className="absolute inset-0"
      >
        {/* Stroke ring — same pattern as LinkedIn: fades out on hover so
            the parent <a>'s purple background reads through cleanly. */}
        <rect
          x="0.5"
          y="0.5"
          width="39"
          height="39"
          rx="19.5"
          stroke="currentColor"
          className="transition-opacity group-hover:opacity-0 group-focus-visible:opacity-0"
        />
        {/* Camera body (rounded square) */}
        <rect
          x="13"
          y="13"
          width="14"
          height="14"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
        />
        {/* Lens */}
        <circle
          cx="20"
          cy="20"
          r="3.4"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
        />
        {/* Flash / corner dot */}
        <circle cx="23.7" cy="16.3" r="0.9" fill="currentColor" />
      </svg>
    </a>
  );
}
function LinkedInIcon({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="LinkedIn"
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[#4B28FF] transition-colors duration-200 hover:bg-[#4B28FF] hover:text-white focus-visible:bg-[#4B28FF] focus-visible:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4B28FF]"
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden
        className="absolute inset-0"
      >
        {/* Stroke ring — visible by default, transparent on hover (bg takes over) */}
        <rect
          x="0.5"
          y="0.5"
          width="39"
          height="39"
          rx="19.5"
          stroke="currentColor"
          className="transition-opacity group-hover:opacity-0 group-focus-visible:opacity-0"
        />
        <path
          d="M15.4247 17.6575H12.2241V27.0307H15.4247V17.6575Z"
          fill="currentColor"
        />
        <path
          d="M14.8867 13.2833C14.5816 13.0986 14.2231 13 13.8564 13C13.6117 13 13.3695 13.0439 13.1435 13.1292C12.9176 13.2144 12.7125 13.3394 12.54 13.4969C12.3674 13.6544 12.2309 13.8413 12.1383 14.0468C12.0456 14.2523 11.9986 14.4725 12 14.6945C12.0021 15.0273 12.1128 15.3521 12.3181 15.6279C12.5233 15.9037 12.814 16.1182 13.1534 16.2442C13.4928 16.3702 13.8657 16.4022 14.2251 16.3361C14.5845 16.27 14.9143 16.1088 15.1728 15.8728C15.4314 15.6368 15.6071 15.3366 15.6779 15.01C15.7486 14.6834 15.7113 14.3452 15.5705 14.0379C15.4296 13.7306 15.1917 13.468 14.8867 13.2833Z"
          fill="currentColor"
        />
        <path
          d="M20.5624 17.6571H17.4791L17.4685 27.0496H20.6691V22.4114C20.6691 21.1914 20.9252 20.01 22.5895 20.01C24.2539 20.01 24.2539 21.4141 24.2539 22.4986V27.0302H27.4545V21.8885C27.4545 19.3613 26.8037 17.4247 23.6031 17.4247C22.993 17.403 22.388 17.5321 21.8525 17.7981C21.317 18.0641 20.8711 18.4572 20.5624 18.9352V17.6571Z"
          fill="currentColor"
        />
      </svg>
    </a>
  );
}

/* ────────────────────────────────────────────────────────────
   Ambient glow — pre-baked WebP of the Figma BG.svg layers.
   Originally rendered as live SVG with feGaussianBlur(stdDeviation=167)
   on two large triangular gradient paths — extremely expensive to repaint
   on every scroll/resize. Baked once via PIL (scripts/render_glow.py
   workflow) into /public/footer/glow.webp (25 KB) so the browser just
   blits a static image. Source-of-truth gradients/paths are documented
   in the bake script; if the design changes, regenerate the image.
   ──────────────────────────────────────────────────────────── */
function GlowBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(/footer/glow.webp)" }}
    />
  );
}

/* ────────────────────────────────────────────────────────────
   BG noise overlay — pre-baked tile of Figma's filter0_n.
   Original spec: feTurbulence + feComponentTransfer producing white-at-
   10%-alpha pixels at 51% coverage. The live SVG filter recomputed the
   noise on every paint (a 1440×685 fractal noise eval is not cheap).
   We baked a 256×256 tile (8 KB WebP, seed=5483 for visual parity) and
   tile it with background-repeat — same look, near-zero paint cost.
   ──────────────────────────────────────────────────────────── */
function NoiseOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{
        backgroundImage: "url(/footer/noise.webp)",
        backgroundRepeat: "repeat",
        backgroundSize: "256px 256px",
      }}
    />
  );
}

/* ────────────────────────────────────────────────────────────
   Giant wordmark at the bottom.
   ─────────────────────────────────────────────────────────────
   Reproduces the "BG" group from the Figma export verbatim:

     <g filter="url(#filter0_n)">          ← noise overlay (outer)
       <g filter="url(#filter3_i)">         ← inner shadow (inner)
         <text>TGlobal</text>
       </g>
     </g>

   The text itself was a vector path in the Figma export (lowercase
   "tglobal"). We swap the path for a <text> element so the casing
   can be controlled from the FOOTER_CONTENT config — the visual
   rendering is identical because the filters operate on the
   resulting raster, not on path data.

   Filter specs (verbatim from Figma's filter0_n_107_18576 and
   filter3_i_107_18576, do not tweak):
     • Noise:     fractalNoise baseFreq 0.7692, octaves 3, seed 5483,
                  discrete 51% coverage, white @ 10% alpha, merged
                  back over the source.
     • Shadow:    inset, dy=-5, stdDeviation=15, white @ 40% alpha,
                  blended `plus-lighter` over the source.

   ViewBox 0 0 1193 368 matches the Figma `filter3_i` region
   (1193.09 × 367.479) so the SVG box is the wordmark envelope.
   ──────────────────────────────────────────────────────────── */
function GiantWordmark({ text }: { text: string }) {
  return (
    <svg
      aria-hidden
      /* `bottom: -clamp(20px, 3.5vw, 50px)` mirrors Figma's
         intentional overflow — the wordmark extends past the card's
         bottom edge so its lower portion is clipped by the card's
         overflow:hidden, matching the Desktop-6 frame where the
         text path runs from y=404 to y=735 in a 685-tall viewBox.
         Tune this knob to taste — larger negative value = more
         aggressive clipping. */
      className="pointer-events-none absolute left-1/2 -translate-x-1/2"
      style={{
        bottom: "calc(-1 * clamp(20px, 3.5vw, 50px))",
        width: "min(96%, 1394px)",
        height: "auto",
        willChange: "transform",
      }}
      /* Figma's filter3_i region is 1193 × 367 — sized for the
         *lowercase* "tglobal" path. Capital "TGlobal" has a wider
         glyph bbox (~1394 × 368), so we widen the viewBox to match
         the measured bbox. The filter chain itself (noise + inner
         shadow) is unchanged. */
      viewBox="0 0 1394 368"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        {/* filter0_n — fractal-noise overlay merged back over the
           source. Verbatim from the Figma export. */}
        <filter
          id="footer-wordmark-noise"
          x="-2%"
          y="-2%"
          width="104%"
          height="104%"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.76923078298568726 0.76923078298568726"
            stitchTiles="stitch"
            numOctaves={3}
            seed={5483}
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="luminanceToAlpha"
            result="alphaNoise"
          />
          <feComponentTransfer in="alphaNoise" result="coloredNoise1">
            <feFuncA
              type="discrete"
              tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0"
            />
          </feComponentTransfer>
          <feComposite
            operator="in"
            in2="shape"
            in="coloredNoise1"
            result="noise1Clipped"
          />
          {/* floodOpacity is the grain-intensity knob.
              Figma export = 0.1; that reads "gritty" at 1:1 desktop
              + high-DPI rendering. 0.05 keeps the texture visible
              but makes the letters feel cleaner / less staticy. */}
          <feFlood
            floodColor="#ffffff"
            floodOpacity="0"
            result="color1Flood"
          />
          <feComposite
            operator="in"
            in2="noise1Clipped"
            in="color1Flood"
            result="color1"
          />
          <feMerge>
            <feMergeNode in="shape" />
            <feMergeNode in="color1" />
          </feMerge>
        </filter>

        {/* filter3_i — inner shadow. Verbatim from the Figma export. */}
        <filter
          id="footer-wordmark-shadow"
          x="-2%"
          y="-15%"
          width="104%"
          height="130%"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-5" />
          <feGaussianBlur stdDeviation="15" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.4 0"
          />
          <feBlend mode="plus-lighter" in2="shape" />
        </filter>
      </defs>

      {/* Outer group: noise → wraps the entire wordmark
          Inner group: inner shadow → wraps the text fill
          Order matters — Figma applies shadow first, then grain. */}
      <g filter="url(#footer-wordmark-noise)">
        <g filter="url(#footer-wordmark-shadow)">
          <text
            x="50%"
            y="83%"
            textAnchor="middle"
            fill="#4B28FF"
            fontFamily="var(--font-sans), system-ui, -apple-system, sans-serif"
            fontWeight={400}
            fontSize={394}
            letterSpacing="0"
          >
            {text}
          </text>
        </g>
      </g>
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   MAIN FOOTER
   ──────────────────────────────────────────────────────────── */
export default function Footer() {
  return (
    <footer className="relative w-full bg-white">
      {/*
        ── ROUNDED CARD ──
        Full viewport width (no max-width) — curved top corners always touch
        the viewport edges, no matter how wide the screen is. Height auto on
        mobile/tablet (content-driven), locked to Figma's 685px on desktop.
      */}
      <div className="relative w-full overflow-hidden rounded-t-[32px] bg-[linear-gradient(180deg,#FAF9F8_0%,#FFFFFF_100%)] lg:h-[685px] lg:rounded-t-[48px]">
        <GlowBackground />

        {/*
          ── CONTENT WRAPPER ──
          On mobile/tablet we use flow layout with padding. On desktop we
          switch to Figma's absolute positioning for pixel-perfect match.
          Inner content is always capped at 1280 (content row) / 1320 (divider)
          regardless of card width — so on ultrawide displays the text stays
          centered and legible.
        */}
        <div className="relative mx-auto max-w-[1440px] px-6 pt-10 pb-[180px] sm:px-10 sm:pb-[220px] lg:max-w-none lg:px-0 lg:pt-0 lg:pb-0">
          {/* ── Top content row (brand + links + social) ── */}
          <div className="flex flex-col gap-10 lg:absolute lg:left-1/2 lg:top-[60px] lg:w-[1280px] lg:-translate-x-1/2 lg:flex-row lg:items-start lg:gap-20">
            {/* Brand + tagline (fixed 291px on desktop, fluid otherwise) */}
            <div className="flex flex-col gap-6 lg:w-[291px] lg:shrink-0">
              <BrandMark />
              <p className="max-w-[291px] text-base font-normal leading-6 text-muted">
                {FOOTER_CONTENT.tagline}
              </p>
            </div>

            {/*
              Links cluster. Responsive grid:
              • mobile (<640): 2 cols, Quick Link spans both
              • sm (≥640):     3 cols — Quick Link | Support | Social
              • lg (≥1024):    flex-row with justify-between (Figma layout)
            */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:flex lg:flex-1 lg:items-start lg:justify-between lg:gap-0">
              {/* Quick Link — has two sub-columns internally */}
              <nav
                aria-label="Quick Link"
                className="col-span-2 flex flex-col gap-6 sm:col-span-1 lg:col-auto"
              >
                <h3 className="text-xl font-semibold leading-7 text-black">
                  Quick Link
                </h3>
                <div className="flex items-start gap-10 md:gap-12">
                  {FOOTER_CONTENT.quickLinkColumns.map((column, colIdx) => (
                    <ul
                      key={`ql-col-${colIdx}`}
                      className="flex list-none flex-col gap-3 p-0"
                    >
                      {column.map((link) => (
                        <li key={link.label}>
                          <FooterLink
                            href={link.href}
                            className="whitespace-nowrap text-base font-normal leading-6 text-muted transition-colors hover:text-primary focus-visible:text-primary"
                          >
                            {link.label}
                          </FooterLink>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </nav>

              {/* Support */}
              <nav aria-label="Support" className="flex flex-col gap-6">
                <h3 className="text-xl font-semibold leading-7 text-black">
                  Support
                </h3>
                <ul className="flex list-none flex-col gap-3 p-0">
                  {FOOTER_CONTENT.supportLinks.map((link) => (
                    <li key={link.label}>
                      <FooterLink
                        href={link.href}
                        className="whitespace-nowrap text-base font-normal leading-6 text-muted transition-colors hover:text-primary focus-visible:text-primary"
                      >
                        {link.label}
                      </FooterLink>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Social links — Instagram + LinkedIn only.
                  Width fixed at 152 px to preserve the desktop layout
                  even though we now render 2 icons instead of 3 (the
                  earlier 3-icon row used the full 152 px; the 2-icon
                  row sits left-aligned in that same column). */}
              <div className="flex w-[152px] flex-col gap-4">
                <h3 className="text-base font-semibold leading-[26px] text-black">
                  Social Link
                </h3>
                <div className="flex items-center gap-4">
                  <InstagramIcon href={FOOTER_CONTENT.socialLinks.instagram} />
                  <LinkedInIcon href={FOOTER_CONTENT.socialLinks.linkedin} />
                </div>
              </div>
            </div>
          </div>

          {/*
            ── Divider + copyright ──
            Mobile/tablet: flows below content with a top margin. Divider
            stretches the full content-area width (capped by the wrapper's
            max-w-[1440] + padding).
            Desktop: absolute at top=300, width=1320 centered (Figma).
          */}
          <div className="mt-12 flex w-full flex-col items-center gap-4 lg:absolute lg:left-1/2 lg:top-[300px] lg:mt-0 lg:w-[1320px] lg:-translate-x-1/2">
            <div
              aria-hidden
              className="h-px w-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(75,40,255,0) 0%, #4B28FF 38.16%, rgba(75,40,255,0) 100%)",
              }}
            />
            <p className="text-center text-sm font-normal leading-[22px] text-[#18181B]">
              {FOOTER_CONTENT.copyright}
            </p>
          </div>
        </div>

        {/* Giant "TGlobal" wordmark at the bottom (always clipped by overflow:hidden) */}
        <GiantWordmark text={FOOTER_CONTENT.giantWordmark} />

        {/*
          ── NOISE OVERLAY ──
          Figma's filter0_n (10% white mono noise) sits on TOP of every other
          layer, including the big wordmark and content. This matches Figma's
          `<g filter="url(#filter0_n)">` wrapping order.
        */}
        <NoiseOverlay />
      </div>
    </footer>
  );
}
