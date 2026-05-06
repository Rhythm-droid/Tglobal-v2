import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  BentoGrid,
  BentoTile,
  BorderBeam,
  MagicCard,
  Spotlight,
  WordReveal,
} from "@/components/primitives";
import { cn } from "@/lib/cn";
import { ALL_CLIENTS, CASE_STUDIES, type CaseStudy } from "./data";

/**
 * /work — Case studies index.
 *
 * Page architecture (top → bottom):
 *   1. Hero on near-black background with cursor Spotlight.
 *   2. Bento grid of 4 case studies. The `featured: true` entry takes
 *      a 2-column tile with a BorderBeam orbit; the other three sit as
 *      standard MagicCard tiles with cursor-tracking glow.
 *   3. "All clients" strip — every client TGlobal has worked with,
 *      whether or not they have a detail page yet.
 *   4. CTA bar — "Want to be next?" → /contact.
 *
 * Why dark hero, lavender body:
 *   The site's signature is the lavender-wash hero on /. Repeating
 *   that exact treatment on /work would feel like the same page
 *   twice. Inverting to dark gives /work its own visual identity
 *   while keeping the brand-purple Spotlight as the connecting tissue.
 *
 * This is a server component — Navbar, Footer, BentoGrid are
 * server-renderable. The interactive primitives (Spotlight, MagicCard,
 * BorderBeam, WordReveal) carry their own "use client" so they
 * hydrate selectively.
 */

export const metadata: Metadata = {
  title: "Work",
  description:
    "Case studies from real TGlobal client engagements. Healthcare, fintech, retail, marketplaces — sprints that shipped.",
  alternates: { canonical: "https://tglobal.in/work" },
  openGraph: {
    title: "Work · TGlobal",
    description:
      "Case studies from real client engagements. Sprints that shipped.",
    url: "https://tglobal.in/work",
  },
};

/* ─── Tile component (used 4× in the bento) ─────────────────────────
   Each case study renders the same way; varying the wrapping cell.
   Extracted into a named component so the page body reads as
   composition, not nested-JSX-per-case. */
function CaseStudyTile({
  study,
  className,
}: {
  study: CaseStudy;
  className?: string;
}) {
  return (
    <Link
      href={`/work/${study.slug}`}
      aria-label={`Read the ${study.client} case study`}
      className={cn(
        /* `block` so the entire card area is the click target — better
           accessibility than just the headline being a link.
           `h-full` so the link fills the bento cell (not just its content)
           — keeps the hover treatment uniform regardless of copy length. */
        "block h-full focus-visible:outline-none",
        className,
      )}
    >
      <MagicCard
        as="article"
        className={cn(
          /* `flex-col` so we can push "See case →" to the bottom with
             `mt-auto`, giving every card a uniform CTA position
             regardless of how many lines the outcome takes. */
          "h-full flex flex-col gap-6 p-6 sm:p-8",
          /* Focus ring — appears on keyboard navigation only. */
          "transition-all group-focus-visible:ring-2 group-focus-visible:ring-primary",
        )}
      >
        {/* Top row — client name + industry chip */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-[-0.04em] text-foreground">
              {study.client}
            </h3>
            <p className="mt-1 text-sm font-normal text-muted">
              {study.industry}
            </p>
          </div>
          {/* Arrow icon — animates on hover via the parent `group`
              class on MagicCard. lucide-react is tree-shaken so only
              this single icon ships in the bundle. */}
          <span
            aria-hidden
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:border-primary"
          >
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>

        {/* Outcome — the headline of the tile, the actual story. */}
        <p className="text-lg sm:text-xl font-normal leading-snug text-foreground">
          {study.outcome}
        </p>

        {/* Footer row — duration + "See case" affordance */}
        <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-border/60">
          <span className="text-sm text-muted">{study.duration}</span>
          <span className="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            See case
          </span>
        </div>
      </MagicCard>
    </Link>
  );
}

export default function WorkIndexPage() {
  /* Split into featured + remaining so we can wrap the featured tile
     in a BorderBeam separately. Defensive `?? CASE_STUDIES[0]` so we
     always render *something* even if no case study is marked featured. */
  const featured = CASE_STUDIES.find((cs) => cs.featured) ?? CASE_STUDIES[0]!;
  const remaining = CASE_STUDIES.filter((cs) => cs.slug !== featured.slug);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* ─── Hero ─────────────────────────────────────────────
            Dark background + Spotlight cursor light. The Spotlight
            primitive listens to mousemove and pipes coordinates into
            CSS variables on a radial-gradient overlay. Reduced-motion
            users see a static spotlight (still on-brand). */}
        <Spotlight
          color="rgba(189, 112, 246, 0.22)"
          radius={620}
          className="bg-foreground text-background"
        >
          <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20 pt-32 pb-20 sm:pt-40 sm:pb-28 lg:pt-48 lg:pb-32">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-background/60">
              Selected work
            </p>
            <h1
              className="mt-4 max-w-4xl font-medium leading-[1.02] text-background"
              style={{
                fontSize: "clamp(48px, 7.6vw, 112px)",
                letterSpacing: "-0.05em",
              }}
            >
              Work that{" "}
              <span
                className="italic"
                style={{
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                }}
              >
                ships.
              </span>
            </h1>
            <div className="mt-8 max-w-2xl">
              <WordReveal
                text="Real engagements with real outcomes. Each story below is one client, one sprint cycle, one shipped system."
                as="p"
                className="text-lg sm:text-xl font-normal leading-relaxed text-background/75"
              />
            </div>
          </div>
        </Spotlight>

        {/* ─── Bento grid — 4 case studies ────────────────────── */}
        <section
          aria-labelledby="case-studies-heading"
          className="bg-background py-20 sm:py-28 lg:py-32"
        >
          <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
            <h2 id="case-studies-heading" className="sr-only">
              Case studies
            </h2>

            <BentoGrid columns={3} className="gap-5 sm:gap-6">
              {/* Featured tile — spans 2 cols, wrapped in BorderBeam.
                  The beam orbits the featured tile's perimeter, drawing
                  the eye to the marquee case. Pair the colSpan with
                  rowSpan=2 so the bento balances; the right column
                  stacks the other three tiles. */}
              <BentoTile colSpan={2} rowSpan={2} className="min-h-[340px]">
                <BorderBeam
                  duration={9}
                  borderRadius={24}
                  className="h-full"
                  colorStart="#bd70f6"
                  colorEnd="#4b28ff"
                >
                  <CaseStudyTile study={featured} className="group" />
                </BorderBeam>
              </BentoTile>

              {/* Remaining 3 tiles — standard MagicCard treatment */}
              {remaining.map((study) => (
                <BentoTile key={study.slug} className="min-h-[280px]">
                  <CaseStudyTile study={study} className="group" />
                </BentoTile>
              ))}
            </BentoGrid>
          </div>
        </section>

        {/* ─── All clients strip ──────────────────────────────── */}
        <section
          aria-labelledby="clients-heading"
          className="border-t border-border bg-surface py-20 sm:py-24"
        >
          <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
            <h2
              id="clients-heading"
              className="text-sm font-medium uppercase tracking-[0.18em] text-muted"
            >
              Clients
            </h2>
            <p
              className="mt-4 max-w-3xl font-medium leading-tight text-foreground"
              style={{
                fontSize: "clamp(32px, 4vw, 56px)",
                letterSpacing: "-0.04em",
              }}
            >
              Teams who trusted us with their roadmap.
            </p>

            {/* 5-column grid on desktop, 2 on mobile, 3 on tablet.
                Each cell is a soft pill — the ones with `slug` link
                to the case study, the others render as plain text
                so we don't promise a page that doesn't exist. */}
            <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {ALL_CLIENTS.map((client) => {
                const isLinked = Boolean(client.slug);
                const Inner = (
                  <span
                    className={cn(
                      "block rounded-2xl border border-border bg-background px-5 py-6 text-center text-base sm:text-lg font-medium tracking-[-0.02em] text-foreground",
                      isLinked &&
                        "transition-all hover:border-primary hover:bg-primary hover:text-white hover:-translate-y-0.5",
                    )}
                  >
                    {client.name}
                  </span>
                );
                return (
                  <li key={client.name}>
                    {isLinked ? (
                      <Link
                        href={`/work/${client.slug}`}
                        aria-label={`See the ${client.name} case study`}
                        className="block focus-ring rounded-2xl"
                      >
                        {Inner}
                      </Link>
                    ) : (
                      Inner
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ─── Closing CTA ─────────────────────────────────────── */}
        <section className="bg-background py-20 sm:py-28">
          <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
            <div className="rounded-[32px] bg-foreground px-8 py-16 sm:px-16 sm:py-24 text-background relative overflow-hidden">
              {/* Decorative blob — same lavender glow language as the
                  hero, just tinted for the dark surface. Pure CSS, no
                  JS, no animation cost on mobile. */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary opacity-40"
                style={{ filter: "blur(140px)" }}
              />
              <div className="relative max-w-3xl">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-background/60">
                  What's next
                </p>
                <h2
                  className="mt-4 font-medium leading-[1.05] text-background"
                  style={{
                    fontSize: "clamp(32px, 5vw, 64px)",
                    letterSpacing: "-0.04em",
                  }}
                >
                  Want to be the{" "}
                  <span
                    className="italic"
                    style={{
                      fontFamily:
                        "var(--font-instrument-serif), Georgia, serif",
                    }}
                  >
                    next
                  </span>{" "}
                  case study?
                </h2>
                <p className="mt-6 text-lg sm:text-xl text-background/80 max-w-2xl leading-relaxed">
                  We work in fixed-cost sprints. Tell us what you're trying to
                  ship and we'll come back within 48 hours with a plan.
                </p>
                <div className="mt-10">
                  <Link
                    href="/contact"
                    className="pill pill-primary focus-ring inline-flex"
                  >
                    Start a project
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
