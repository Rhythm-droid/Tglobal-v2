import type { NextConfig } from "next";

/* Bundle analysis is via `next experimental-analyze` (Next 16 + Turbopack).
   The legacy `@next/bundle-analyzer` plugin is webpack-only and a no-op
   under Turbopack — it printed a warning telling us to use the new flag.
   Run `npm run analyze` to invoke it; it generates an interactive treemap
   for the Turbopack build output. */

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

/* react-scan (dev-only diagnostic) does two things our prod CSP refuses:
   1. Phones a version-check fetch to https://www.react-grab.com/api/version
      on every page load (no off-switch in the public API as of v0.5.6).
   2. Spawns a Worker from a blob: URL for its rendering instrumentation.

   We allow both ONLY in dev so the console stays clean during development
   without weakening production security one bit. In production, react-scan
   is dynamic-imported only when NODE_ENV === "development" (see
   src/components/primitives/ReactScan.tsx), so these allowances are
   irrelevant to shipped headers. */
const REACT_SCAN_SCRIPT_DEV = isDev ? " blob:" : "";
const REACT_SCAN_CONNECT_DEV = isDev ? " https://www.react-grab.com" : "";
const REACT_SCAN_WORKER_DEV = isDev ? "blob:" : "'self'";

const CSP = [
  "default-src 'self'",
  // `https://static.cloudflareinsights.com` hosts the Cloudflare Web
  // Analytics beacon (loaded by layout.tsx <Script>). Without it on
  // script-src, CSP blocks the beacon and Cloudflare's measurement
  // never fires AND a real CSP violation gets logged to the console.
  // Image/connect not needed — the beacon doesn't fetch additional
  // resources from that origin.
  `script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com${isDev ? " 'unsafe-eval'" : ""}${REACT_SCAN_SCRIPT_DEV}`,
  // worker-src controls Web Worker / SharedWorker / ServiceWorker sources.
  // Dev: react-scan creates a worker from a blob: URL for its render tracker.
  // Prod: only same-origin workers allowed.
  `worker-src ${REACT_SCAN_WORKER_DEV}`,
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
  // Cloudflareinsights.com receives the beacon's pageview events;
  // without it, CSP silently drops every measurement fetch.
  `connect-src 'self' https://api.web3forms.com https://cloudflareinsights.com${REACT_SCAN_CONNECT_DEV}`,
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
