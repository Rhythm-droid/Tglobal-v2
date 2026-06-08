/* IMPORTANT — ReactScan must be the FIRST app-level import.
   react-scan instruments React's render path; it has to load before any
   other client component so it can observe their first render too. The
   official Next 14+ app-router docs require this ordering verbatim. */
import { ReactScan } from "@/components/primitives/ReactScan";

import type { Metadata } from "next";
import { Albert_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import CustomCursor from "@/components/primitives/CustomCursor";
import MotionProvider from "@/components/primitives/MotionProvider";
import PageTransition from "@/components/primitives/PageTransition";
import SmoothScrollProvider from "@/components/primitives/SmoothScrollProvider";
import "lenis/dist/lenis.css";
import "./globals.css";

const albertSans = Albert_Sans({
  variable: "--font-albert-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* Editorial accent serif for the highlighted word in the hero
   headline ("Friction"). Loaded only in italic — that's the only
   variant we use; pulling in `normal` would add bytes the page never
   exercises. Exposed as `--font-instrument-serif` so any future
   accent text can opt-in via `font-family: var(--font-instrument-serif)`. */
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
});

/* Editorial mono — used for tabular indices ("№ 01"), eyebrow labels,
   and any micro-copy that wants the print/spec-sheet feel. JetBrains
   Mono has the geometric-but-warm proportions that pair cleanly with
   Albert Sans without competing for the headline role. Two weights so
   we can vary label vs caption without loading more variants. */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const isStaging = process.env.NEXT_PUBLIC_ENV === "staging";

const SITE_URL = "https://tglobal.in";
const SITE_NAME = "TGlobal";
const SITE_TITLE = "TGlobal — Software, Without the Friction";
const SITE_DESCRIPTION =
  "A new way to build — where ideas turn into systems, and systems turn into products. AI-native engineering that ships 4× faster, with humans still in charge.";

export const metadata: Metadata = {
  title: {
    /* `default` runs on routes that don't set their own title.
       `template` is used by child routes — they pass just their page
       name (e.g. "About") and the layout appends " · TGlobal" so every
       tab title shares the brand without each page re-typing it. */
    default: SITE_TITLE,
    template: "%s · TGlobal",
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  generator: "Next.js",
  keywords: [
    "AI engineering",
    "software development agency",
    "product engineering",
    "AI-native development",
    "rapid prototyping",
    "fixed-cost sprints",
    "TGlobal",
  ],
  /* Canonical URL — tells search engines this is the master copy of
     the page when it might be reachable via multiple URLs (e.g. with
     UTM params). Set per-page on detail routes; layout sets the
     site root. */
  alternates: {
    canonical: SITE_URL,
  },
  robots: isStaging
    ? {
        index: false,
        follow: false,
        googleBot: { index: false, follow: false },
      }
    : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    /* Image is auto-injected by Next from src/app/opengraph-image.tsx —
       we don't need to list it here. The convention picks it up at
       build time and adds the correct meta tags. Listing it explicitly
       would only override per-page opengraph-image.tsx if any case
       study route adds one later. */
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    /* Image: same auto-resolution rule as openGraph. */
  },
  /* Search engine verification tokens — paste real ones once we add
     Google Search Console + Bing Webmaster Tools in Saturday's QA pass.
     Empty strings are no-ops. */
  verification: {
    google: "",
    other: {
      "msvalidate.01": "",
    },
  },
};

/* ─── Structured data (JSON-LD) ───────────────────────────────────
 * Two schemas, served in separate inline scripts per Google's recommendation:
 *
 *   1. Organization — tells Google "this is a company called TGlobal"
 *      so the brand can appear in Knowledge Panel results, with logo,
 *      social profiles (sameAs), and contact channel.
 *
 *   2. WebSite — registers the site with a SearchAction URL template,
 *      enabling the in-search "search this site" box that appears on
 *      branded queries (when Google decides to show it).
 *
 * The SearchAction `target` URL is a Google-required template literal —
 * the {search_term_string} placeholder is filled by Google at search
 * time. We don't actually have a /search route yet, but the pattern is
 * cheap to add and shouldn't be skipped just because the route isn't
 * built — Google will only show the box when it's confident, which
 * gives us time to ship a search page later if SEO data shows demand.
 */
const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/opengraph-image`,
  description: SITE_DESCRIPTION,
  sameAs: [
    "https://www.instagram.com/tglobal_ai",
    "https://www.linkedin.com/company/tglobal-digital/",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "growth@tglobal.in",
    availableLanguage: ["English"],
  },
} as const;

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  publisher: { "@type": "Organization", name: SITE_NAME },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
} as const;

/* Cloudflare Web Analytics token — env-gated so analytics only fires
   when configured. Free, cookieless, no consent banner needed.
   Sign up at https://dash.cloudflare.com/?to=/:account/web-analytics
   and paste the token into NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN.

   Skipped in `next dev` regardless of token presence: Cloudflare's
   beacon validates that the request origin matches the domain
   registered against the token, so any localhost request fails the
   CORS preflight and dumps two red errors into the dev console on
   every page load. Suppressing the script in development keeps the
   console clean AND avoids burning a phantom pageview against the
   prod analytics quota every time we hit refresh locally. */
const isProdRuntime = process.env.NODE_ENV === "production";
const CF_ANALYTICS_TOKEN = isProdRuntime
  ? process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN
  : undefined;
const GA_MEASUREMENT_ID = isProdRuntime
  ? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  : undefined;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${albertSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      {/* react-scan — dev-only render visualiser. Mounted ABOVE <head>/<body>
          per the Next 14+ recommended pattern so it instruments React before
          any client component hydrates. The component itself returns null in
          production and dynamic-imports the runtime only in dev, so prod
          bundles are unaffected. Replaces the previous unpkg <Script> tag
          which was blocked by the project's strict CSP. */}
      <ReactScan />
      <head>
        {/* JSON-LD structured data. Two separate <script> tags rather
            than one merged @graph — easier for Google to parse, easier
            for us to debug in Rich Results test. `dangerouslySetInnerHTML`
            with JSON.stringify is the standard React pattern; the data
            comes from typed const objects above so there's no XSS risk
            from interpolated user input. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ORGANIZATION_SCHEMA),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(WEBSITE_SCHEMA),
          }}
        />
      </head>
      <body
        id="top"
        className="min-h-full flex flex-col bg-background text-foreground font-sans"
      >
        {/* Skip link — keyboard-first users press Tab on page load
            and land here. Pressing Enter jumps focus into <main>,
            bypassing the navbar. Visually hidden until focused;
            on :focus it pops into the top-left at z-9999 with
            brand-primary background. WCAG 2.4.1 (Bypass Blocks). */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[9999] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
        >
          Skip to main content
        </a>

        {/* No-JS fallback — if the user has JavaScript disabled or
            the bundle fails to load, give them a direct line to the
            team instead of a blank page. Crawlers also see this as
            part of the page's content surface. */}
        <noscript>
          <div
            style={{
              padding: "16px",
              background: "#fbf8f1",
              color: "#0e0a1e",
              textAlign: "center",
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: "15px",
              lineHeight: 1.5,
            }}
          >
            This site is best experienced with JavaScript enabled. To
            reach us directly, email{" "}
            <a
              href="mailto:growth@tglobal.in"
              style={{ color: "#4b28ff", textDecoration: "underline" }}
            >
              growth@tglobal.in
            </a>
            .
          </div>
        </noscript>

        <SmoothScrollProvider>
          <MotionProvider>
            {/* CustomCursor mounted at the root so it persists across
                route transitions and appears on every page. The
                component self-disables on touch / coarse-pointer
                devices and under prefers-reduced-motion, so mounting
                it globally is safe. */}
            <CustomCursor />
            {/* PageTransition wraps every route in a fade+y-shift on
                navigation. `initial={false}` inside the component
                prevents an unwanted enter animation on first paint. */}
            <PageTransition>{children}</PageTransition>
          </MotionProvider>
        </SmoothScrollProvider>

        {/* Cloudflare Web Analytics — loads only when the env var is set,
            so dev/staging/preview deploys don't pollute production data.
            `strategy="afterInteractive"` defers until after hydration so
            it never blocks the Largest Contentful Paint. */}
        {!isStaging && CF_ANALYTICS_TOKEN ? (
          <Script
            id="cf-web-analytics"
            strategy="afterInteractive"
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: CF_ANALYTICS_TOKEN })}
          />
        ) : null}

        {/* Google Analytics 4 — env-gated and loaded after hydration so
            local/staging traffic stays out of production reports and the
            tag does not block rendering. */}
        {!isStaging && GA_MEASUREMENT_ID ? (
          <>
            <Script
              id="google-analytics-loader"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script id="google-analytics-config" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
