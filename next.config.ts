import type { NextConfig } from "next";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Production-grade security headers.
 *
 * These blunt the common client-side attack surface (XSS, clickjacking,
 * MIME-sniffing, referrer leaks, unwanted feature access). They do NOT
 * mitigate volumetric DDoS — that has to be handled upstream by the CDN /
 * hosting layer (Vercel, Cloudflare, etc.).
 *
 *   • Content-Security-Policy → limits where scripts/styles/media can load
 *     from. `'unsafe-inline'` on script/style is required by Next.js's
 *     framework runtime and by framer-motion's inline style updates; that
 *     can be tightened to a nonce-based policy later via middleware.
 *   • Strict-Transport-Security → forces HTTPS on any future visit.
 *   • X-Frame-Options + frame-ancestors → prevents the site being iframed.
 *   • X-Content-Type-Options → blocks MIME sniffing.
 *   • Referrer-Policy → avoids leaking full URLs cross-origin.
 *   • Permissions-Policy → denies access to sensors/APIs we never use.
 *   • Cross-Origin-Opener-Policy → isolates browsing context.
 *
 * `poweredByHeader: false` drops the `X-Powered-By: Next.js` fingerprint so
 * attackers have one less free hint about the stack.
 * ─────────────────────────────────────────────────────────────────────────────
 */
/**
 * `'unsafe-eval'` is required by Next's dev server (HMR uses Function()
 * eval) but NOT by production — framer-motion, GSAP, and our code all
 * avoid eval. Dropping it in prod shrinks the XSS surface meaningfully.
 *
 * `'unsafe-inline'` stays on both `script-src` and `style-src`:
 *   • Next 16 emits inline boot scripts for the React runtime/streaming
 *   • AnimateIn is now pure CSS, but the rest of the site still uses
 *     inline `style={{}}` blocks for Figma-fidelity layouts, so the
 *     style policy can't shed 'unsafe-inline' without a nonce.
 *
 * A nonce-based CSP (stricter) needs a middleware layer that injects a
 * per-request nonce into every inline tag. Tracked as a follow-up.
 */
const isDev = process.env.NODE_ENV !== "production";

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // `https://flagcdn.com` is whitelisted ONLY for img-src — it serves
  // the SVG country flags shown in the phone-number picker (see
  // src/components/primitives/CountryPicker.tsx and src/lib/countries.ts).
  // Image-only allowlist; no script, frame, or connect access granted.
  "img-src 'self' data: blob: https://flagcdn.com",
  "font-src 'self' data:",
  // Web3Forms is the form-to-email backend used by the #talk-to-us
  // section in CTA.tsx. Whitelist its API endpoint so the fetch call
  // isn't blocked by the connect-src directive.
  "connect-src 'self' https://api.web3forms.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  // form-action governs where <form> can POST to. The form here uses
  // fetch() (covered by connect-src) instead of native form submission,
  // but we keep form-action permissive for the same Web3Forms domain
  // in case we ever fall back to a no-JS submit.
  "form-action 'self' https://api.web3forms.com",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
] as const;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...SECURITY_HEADERS],
      },
      {
        // Static, content-addressable assets — cache for a year.
        // Replace any of these files by changing the filename, never by
        // overwriting in place.
        source: "/:dir(brands|integrations|footer)/:file*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
