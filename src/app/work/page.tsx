import type { Metadata } from "next";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { ScrollProgress } from "@/components/primitives";
import WorkHero from "@/components/work/WorkHero";
import WorkFeatured from "@/components/work/WorkFeatured";
import WorkGrid from "@/components/work/WorkGrid";
import WorkMarquee from "@/components/work/WorkMarquee";
import WorkProcessTeaser from "@/components/work/WorkProcessTeaser";
import WorkMetrics from "@/components/work/WorkMetrics";
import WorkTestimonials from "@/components/work/WorkTestimonials";
import WorkCTA from "@/components/work/WorkCTA";
import { CASE_STUDIES } from "./data";

/* Marquee tokens — dot-separated kinetic typography for the divider
   strip between grid and process teaser. Mix of client + outcome +
   sector verbs so the strip reads as a poem about what the agency
   actually does, not a bag of buzzwords. */
const MARQUEE_TOKENS = [
  "Healthcare RCM",
  "Optum-integrated",
  "Smart sub-metering",
  "150K+ lives impacted",
  "AI mock interviews",
  "Real-time energy",
  "Magento at scale",
  "Manufacturing CRM",
  "Bilingual checkout",
  "Friday demos",
  "Shipped",
] as const;

/**
 * /work — Case studies index.
 *
 * Section flow (top → bottom, magazine rhythm):
 *   01 — WorkHero            ink black + Spotlight + italic accent
 *   02 — WorkIndustryStrip   white hairline connector, chip row
 *   03 — WorkFeatured        white, BorderBeam marquee tile
 *   04 — WorkGrid            white, asymmetric 9-tile grid
 *   05 — WorkMetrics         lavender wash, NumberTicker tally
 *   06 — WorkClients         white, pill grid with scramble swap
 *   07 — WorkCTA             ink black + lavender blob + magnetic pill
 *
 * Why the rhythm matters: same dark→light→dark beat as /about and
 * /process, so a user scrolling between pages doesn't feel they've
 * landed in a different brand. The hero and the CTA bracket the page
 * in dark; the editorial middle carries the story.
 *
 * Each section is its own client component because every section has
 * at least one cursor-tracking or scroll-driven primitive that needs
 * the browser to hydrate. The page itself is a server component —
 * Navbar, Footer, and the JSON-LD schemas render at the edge.
 */

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected case studies from real TGlobal client engagements. Ten clients, nine industries, three continents — every one shipped to production.",
  alternates: { canonical: "https://tglobal.in/work" },
  openGraph: {
    type: "website",
    title: "Work · TGlobal",
    description:
      "Selected case studies from real engagements. Healthcare, manufacturing, PropTech, AI EdTech, e-commerce, retail, textile, cleantech, telecom.",
    url: "https://tglobal.in/work",
    siteName: "TGlobal",
  },
  twitter: {
    card: "summary_large_image",
    title: "Work · TGlobal",
    description:
      "Selected case studies from real engagements — every one shipped to production.",
  },
  /* The /work index is launch-ready, so it inherits index/follow from the
     root layout (no robots override here). Only the case-study DETAIL
     pages (/work/[slug]) stay gated until client sign-off — that gate
     lives in work/[slug]/page.tsx (robots noindex) and the `/work/`
     Disallow in robots.ts. */
};

/* JSON-LD — collection page + breadcrumbs. ItemList isn't ideal for an
   index of case studies (which are CreativeWorks) but it's the cleanest
   way to give Google a structured list of the engagements without
   inflating the page weight with per-item schema. */
const WEBPAGE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  url: "https://tglobal.in/work",
  name: "Work · TGlobal",
  description:
    "Selected case studies from real TGlobal client engagements.",
  mainEntity: {
    "@type": "ItemList",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: CASE_STUDIES.length,
    itemListElement: CASE_STUDIES.map((cs, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: cs.client,
      url: `https://tglobal.in/work/${cs.slug}`,
    })),
  },
} as const;

const BREADCRUMB_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://tglobal.in",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Work",
      item: "https://tglobal.in/work",
    },
  ],
} as const;

export default function WorkIndexPage() {
  /* Featured tile = the one entry marked `featured: true` in data.ts.
     Fallback to the first entry so the page always renders something
     in the marquee slot. The remaining cards (all 9 non-featured) go
     into the asymmetric grid below. */
  const featured = CASE_STUDIES.find((cs) => cs.featured) ?? CASE_STUDIES[0]!;
  const remaining = CASE_STUDIES.filter((cs) => cs.slug !== featured.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBPAGE_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_SCHEMA) }}
      />
      {/* ScrollProgress sits at the very top of the viewport, fills as
          the user scrolls — same affordance as /process and the case
          study detail pages, so the site feels coherent. */}
      <ScrollProgress />
      {/* Light lavender hero → Navbar in light theme so the logo + nav
          links read in dark ink against the paper-white shader. Mirrors
          /about which uses the same lavender mesh + light navbar. */}
      <Navbar theme="light" />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <WorkHero />
        <WorkFeatured study={featured} />
        <WorkGrid studies={remaining} />
        {/* Kinetic marquee — visual breath between the dense grid and
            the dark process slab. Velocity-distorted, scroll-responsive. */}
        <WorkMarquee items={MARQUEE_TOKENS} variant="ink" speed={36} />
        <WorkProcessTeaser />
        <WorkMetrics />
        <WorkTestimonials />
        <WorkCTA />
      </main>
      <Footer />
    </>
  );
}
