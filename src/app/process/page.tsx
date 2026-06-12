import type { Metadata } from "next";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import FilmGrain from "@/components/about/FilmGrain";
import ProcessAnatomy from "@/components/process/ProcessAnatomy";
import ProcessArtifacts from "@/components/process/ProcessArtifacts";
import ProcessContrast from "@/components/process/ProcessContrast";
import ProcessCTA from "@/components/process/ProcessCTA";
import ProcessHero from "@/components/process/ProcessHero";
import ProcessQA from "@/components/process/ProcessQA";
import ProcessSectionNav from "@/components/process/ProcessSectionNav";
import ProcessSteps from "@/components/process/ProcessSteps";
import ProcessTriptych from "@/components/process/ProcessTriptych";
import { ScrollProgress } from "@/components/primitives";

export const metadata: Metadata = {
  title: "How we work",
  description:
    "Sprints, not quarters. A week to scope, two weeks to ship. Here's exactly how a TGlobal engagement runs from first call to live system.",
  alternates: { canonical: "https://tglobal.in/process" },
  openGraph: {
    type: "website",
    title: "How we work · TGlobal",
    description:
      "Demos trump decks. Two weeks to ship. Here's exactly how every engagement runs.",
    url: "https://tglobal.in/process",
    siteName: "TGlobal",
  },
  twitter: {
    card: "summary_large_image",
    title: "How we work · TGlobal",
    description: "Demos trump decks. Two weeks to ship.",
  },
};

/* JSON-LD — page-specific schemas, separate from the site-wide
   Organization + WebSite in layout.tsx. Three blocks:

     1. WebPage — declares this page with mainEntity = Organization
     2. BreadcrumbList — Home → How we work
     3. Service — the two-week fixed-cost sprint offering. */

const WEBPAGE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  url: "https://tglobal.in/process",
  name: "How we work · TGlobal",
  description:
    "Sprints, not quarters. A week to scope, two weeks to ship. Here's exactly how a TGlobal engagement runs from first call to live system.",
  mainEntity: {
    "@type": "Organization",
    name: "TGlobal",
    url: "https://tglobal.in",
  },
  isPartOf: { "@type": "WebSite", name: "TGlobal", url: "https://tglobal.in" },
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
      name: "How we work",
      item: "https://tglobal.in/process",
    },
  ],
} as const;

/* Service schema — the 2026-relevant type for a methodology page
   (HowTo schema was removed: Google dropped HowTo rich results in
   2023, so it was dead weight in every crawl). */
const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Two-Week Fixed-Cost Product Development",
  serviceType: "Software development",
  description:
    "Full-stack product delivery in fixed-cost two-week sprints — one-page SOW, Friday demos, production code by week three, full code ownership transfer from day one.",
  provider: {
    "@type": "Organization",
    name: "TGlobal",
    url: "https://tglobal.in",
  },
  areaServed: "Worldwide",
  url: "https://tglobal.in/process",
} as const;

/* /process — eight-beat editorial.
   ─────────────────────────────────────────────────────────────
   Sister page to /about. Same scaffolding (ScrollProgress, dot
   rail, FilmGrain) and same aesthetic vocabulary (lavender wash,
   italic-serif accent words, dark CTA block) so the two pages
   read as chapters of one book.

     01 Hero        — "The Quarter Collapse": a wall of 91 ghost
                      day-cells (one agency quarter) is crushed by
                      scroll into ten commit nodes on a git branch;
                      the headline builds in behind a cursor and a
                      LIVE pill stamps on FRI W2.
     02 Contrast    — six-row table contrasting typical agency vs
                      TGlobal across discovery, cadence, artifact,
                      pricing, ownership, on-call.
     03 Five Steps  — Scope It / Wire It Up / Ship in Cycles / Go
                      Live / Own It. Each step is a MagicCard on a
                      vertical purple timeline.
     04 Anatomy     — 10-day grid showing one full sprint with a
                      "Five days in." halfway badge and "Ship"
                      badge on Fri W2.
     05 Triptych    — Foundation / Build / Ship — three frames
                      naming actual tooling (Postgres, Next.js,
                      Datadog, etc) with one-liner captions per
                      tool.
     06 Artifacts   — marquee strip of stylised-realistic
                      artifacts (PRs, runbook entries, Friday
                      demos, ADRs, deploys, postmortems, feature
                      flags) so the reader sees the actual output
                      shape, not stock images.
     07 Q&A         — three editorial Q&A pairs (timeline, hidden
                      fees, code ownership) — every answer ends on
                      a concrete commitment.
     08 CTA         — dark rounded block with purple blur glow,
                      "We don't talk about it. We ship it." +
                      dual pill buttons.

   Site furniture:
     • ScrollProgress  — 3px brand-purple bar at viewport top
     • ProcessSectionNav — sticky vertical dot rail (desktop only)
     • FilmGrain       — global SVG feTurbulence texture overlay */

export default function ProcessPage() {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_SCHEMA) }}
      />

      <ScrollProgress />
      <ProcessSectionNav />
      <FilmGrain />

      <Navbar theme="light" />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 bg-background text-foreground"
      >
        <ProcessHero />
        <ProcessContrast />
        <ProcessSteps />
        <ProcessAnatomy />
        <ProcessTriptych />
        <ProcessArtifacts />
        <ProcessQA />
        <ProcessCTA />
      </main>
      <Footer />
    </>
  );
}
