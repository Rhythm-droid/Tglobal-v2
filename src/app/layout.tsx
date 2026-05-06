import type { Metadata } from "next";
import { Albert_Sans, Instrument_Serif } from "next/font/google";
import Script from "next/script";
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
   and paste the token into NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN. */
const CF_ANALYTICS_TOKEN = process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${albertSans.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
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
        <SmoothScrollProvider>
          <MotionProvider>
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
      </body>
    </html>
  );
}
