import type { Metadata } from "next";

import AboutCTA from "@/components/about/AboutCTA";
import AboutHero from "@/components/about/AboutHero";
import AboutSectionNav from "@/components/about/AboutSectionNav";
import AboutTeam from "@/components/about/AboutTeam";
import AboutTriptych from "@/components/about/AboutTriptych";
import AboutWorkStrip from "@/components/about/AboutWorkStrip";
import FilmGrain from "@/components/about/FilmGrain";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { ScrollProgress } from "@/components/primitives";

export const metadata: Metadata = {
  title: "About",
  description:
    "The operating model behind TGlobal: fixed-cost sprints, AI-native engineering, human judgment, and production ownership.",
  alternates: { canonical: "https://tglobal.in/about" },
  openGraph: {
    type: "website",
    title: "About · TGlobal",
    description:
      "Fixed-cost sprints, AI-native engineering, human judgment, and production ownership.",
    url: "https://tglobal.in/about",
    siteName: "TGlobal",
    /* OG image is auto-injected by Next from
       src/app/about/opengraph-image.tsx — page-specific share card
       with "The humans behind the sprints." headline + founder names
       in the footer bar. */
  },
  twitter: {
    card: "summary_large_image",
    title: "About · TGlobal",
    description:
      "Fixed-cost sprints, AI-native engineering, human judgment, and production ownership.",
  },
};

/* ─── JSON-LD structured data for /about ─────────────────────────
   These are page-specific schemas, separate from the site-wide
   Organization + WebSite schemas in layout.tsx. Three blocks:

     1. AboutPage    — declares this page as the "about" of the
                       Organization (helps Google understand site
                       hierarchy and pick up the Knowledge Panel
                       "About" section).
     2. Person[]     — one per founder. Names, roles, emails,
                       and `worksFor` link them to the Organization.
                       Used by Google for founder-name SERP cards.
     3. BreadcrumbList — Home → About. Renders as breadcrumbs in
                         search results when Google decides to show
                         them (more clickable, higher CTR).

   We keep these in three separate <script> tags rather than one
   merged @graph because each is independently testable in Google's
   Rich Results tool. */

const ABOUT_PAGE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  url: "https://tglobal.in/about",
  name: "About TGlobal",
  description:
    "The operating model behind TGlobal: fixed-cost sprints, AI-native engineering, human judgment, and production ownership.",
  mainEntity: { "@type": "Organization", name: "TGlobal", url: "https://tglobal.in" },
  isPartOf: { "@type": "WebSite", name: "TGlobal", url: "https://tglobal.in" },
} as const;

const FOUNDERS_SCHEMA = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Chandan Gupta",
    jobTitle: "Co-founder · Forward Deployed Engineer",
    email: "mailto:chandan@tglobal.in",
    worksFor: { "@type": "Organization", name: "TGlobal", url: "https://tglobal.in" },
    url: "https://tglobal.in/about",
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Dhruv Gupta",
    jobTitle: "Co-founder · Technical Project Manager",
    email: "mailto:dhruv@tglobal.in",
    worksFor: { "@type": "Organization", name: "TGlobal", url: "https://tglobal.in" },
    url: "https://tglobal.in/about",
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Rhythm Mittal",
    jobTitle: "Co-founder · Engineer",
    email: "mailto:rhythm@tglobal.in",
    worksFor: { "@type": "Organization", name: "TGlobal", url: "https://tglobal.in" },
    url: "https://tglobal.in/about",
  },
] as const;

const BREADCRUMB_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://tglobal.in" },
    { "@type": "ListItem", position: 2, name: "About", item: "https://tglobal.in/about" },
  ],
} as const;

/* /about — five-beat editorial.
   ─────────────────────────────────────────────────────────────
   Trimmed from a nine-beat magazine spread to the five sections
   that each say something the previous one didn't:

     01 Opening      — pinned canvas. Hero copy fades, the manifesto
                       materialises at viewport centre, travels to the
                       left rail, three principles cycle on the right
                       via scramble swap. Ends with a lavender wash
                       that hands off seamlessly to the next section.
     02 Team         — Liquid-Metal portraits + mask-reveal names.
                       Faces behind the studio's "small senior team"
                       promise. Placed early so visitors meet the
                       humans before the proof points.
     03 Work         — three live case studies. Lands AFTER the team
                       intro so the names attached to the work are
                       already known to the reader.
     04 Triptych     — Ship / Taste / Own as cinematic full-bleed
                       frames. Restates the manifesto principles
                       visually — the page's tonal inhale, placed
                       next to the CTA so the principles are the
                       last beat the eye holds before the pill.
     05 CTA          — final call to start a sprint.

   Removed in the cut: Marquee (decoration recycling manifesto
   phrases), Operating Model (long-form restatement of manifesto
   principle №2), Sprint Engine (duplicated /process page), Standards
   (count-up stats not backed by hard numbers), the founder-letter
   draft, and the particle-break experiments. Their files were
   deleted with the section cut; the lean version loads ~700 fewer
   lines of TSX and the page reads tighter.

   Top-of-page scaffolding:
     • ScrollProgress  — 3px brand-purple bar at viewport top.
     • CustomCursor    — site-wide three-state cursor (dot / ring /
                         pill-with-label) for desktop pointer users.
     • AboutSectionNav — sticky vertical dot rail (desktop only).
     • FilmGrain       — global SVG feTurbulence texture overlay.

   Performance:
     • The opening stage runs a single pinned GSAP ScrollTrigger;
       the timeline fades the hero copy, reveals the manifesto, and
       fades to lavender by the moment the pin releases. No external
       transition zone is needed because the pin's last frame IS the
       handoff colour.
     • Shader / particle canvases pause their rAF loop when their
       section is off-screen via IntersectionObserver (useInView).
     • maxPixelCount caps each shader at ~1.4M pixels. */

export default function AboutPage() {
  return (
    <>
      {/* JSON-LD structured data. Three blocks, server-rendered, so
          Googlebot's renderer sees them in the initial HTML without
          waiting for hydration. `dangerouslySetInnerHTML` with
          JSON.stringify is the standard React pattern — no XSS risk
          because the source data is typed const objects above, not
          user input. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ABOUT_PAGE_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_SCHEMA) }}
      />
      {FOUNDERS_SCHEMA.map((founder) => (
        <script
          key={founder.name}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(founder) }}
        />
      ))}

      <ScrollProgress />
      <AboutSectionNav />
      <FilmGrain />

      <Navbar theme="light" />
      <main id="main-content" tabIndex={-1} className="flex-1 bg-background text-foreground">
        {/* 01 — Opening: hero + manifesto live in one pinned canvas
            so the background never changes between them. The pin's
            exit-wash repaints the viewport to the next section's
            lavender — no gradient strip needed. */}
        <div id="about-hero">
          <AboutHero />
        </div>

        {/* 02 — Team (swapped with Work — meet the humans first,
            then see their output). */}
        <div id="about-team">
          <AboutTeam />
        </div>

        {/* 03 — Work (swapped with Team — case studies attached to
            the names you just met). */}
        <div id="about-work">
          <AboutWorkStrip />
        </div>

        {/* 04 — Triptych (moved next to CTA — the visual inhale
            "ship / taste / own" lands right before the call to
            action, making the principles the last thing the eye
            holds before the pill). */}
        <div id="about-triptych">
          <AboutTriptych />
        </div>

        {/* 05 — CTA */}
        <div id="about-cta">
          <AboutCTA />
        </div>
      </main>
      <Footer />
    </>
  );
}
