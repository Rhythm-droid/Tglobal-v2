/**
 * Case study data — single source of truth for /work and /work/[slug].
 *
 * Why a typed data file (not a CMS):
 *   • Phase 1 has 4 case studies. A CMS (Sanity, Contentful, Notion API)
 *     adds external dependencies, auth, and ~150KB to the page weight
 *     for content that changes once a quarter. A typed data file is
 *     compile-time safe, zero-runtime-cost, and trivially diffable in
 *     git. Phase 2 may revisit if blog/insights need editor UI.
 *   • Static type checking on shape: forget a field and the build
 *     fails before deploy. CMS = field missing, page renders blank.
 *
 * Editing rule:
 *   When the four featured clients are confirmed (Skyline, Medcollect,
 *   JIJIBAI, Turpai), replace the placeholder fields below in-place.
 *   Each entry generates one /work/[slug] route via generateStaticParams
 *   in src/app/work/[slug]/page.tsx and one tile in /work index.
 *
 *   The slug also goes into src/app/sitemap.ts as a uncommented entry
 *   so Google indexes the new pages.
 */

export interface CaseStudyMetric {
  /** Number portion — string so units like "60%" or "$200K" work. */
  readonly value: string;
  /** Short label below the number. ~20 chars max for clean layout. */
  readonly label: string;
}

export interface CaseStudyTestimonial {
  readonly quote: string;
  readonly author: string;
  readonly role: string;
}

export interface CaseStudy {
  /** URL slug — lowercased, hyphenated, matches /work/[slug]. */
  readonly slug: string;
  /** Display name of the client. */
  readonly client: string;
  /** Industry / sector — appears as a chip on the index tile. */
  readonly industry: string;
  /** One-line outcome. The headline that appears on the index tile. */
  readonly outcome: string;
  /** Engagement length — appears in the at-a-glance metric bar. */
  readonly duration: string;
  /** 2-3 sentences describing what was broken / why they came to us. */
  readonly challenge: string;
  /** 3 bullet points — top-level moves we made. */
  readonly approach: readonly string[];
  /** 5-8 tech items — appears as a marquee row. */
  readonly stack: readonly string[];
  /** 3-4 results with numbers — appears as the big NumberTicker stats. */
  readonly results: readonly CaseStudyMetric[];
  /** Optional pull quote from the client. */
  readonly testimonial?: CaseStudyTestimonial;
  /** True for the one case study highlighted on the /work index with
      a BorderBeam treatment. Only ONE case study should be featured. */
  readonly featured?: boolean;
  /**
   * Optional cover image path (relative to /public). When absent, the
   * detail page falls back to a typography-only hero. Recommended size:
   * 2400×1350 (16:9) for retina-ready full-bleed display. WebP preferred.
   */
  readonly cover?: string;
  /**
   * Hero accent color — drives the case study detail page's gradient
   * accents. Falls back to brand purple if not set. Use a hex that
   * harmonises with the client's brand if their logo is in the cover.
   */
  readonly accentColor?: string;
}

/* ─── Phase 1 case studies ────────────────────────────────────────
   PLACEHOLDER content — every field below needs to be replaced with
   real data from the boss before Saturday QA. The structure is locked
   so swap-in is a one-line-per-field edit.
   ────────────────────────────────────────────────────────────────── */
export const CASE_STUDIES: readonly CaseStudy[] = [
  {
    slug: "skyline",
    client: "Skyline",
    industry: "TBD — Industry/Sector",
    outcome: "TBD — One-line outcome describing what we shipped and the result.",
    duration: "TBD weeks",
    challenge:
      "TBD — 2-3 sentences explaining what was broken or why the client came to TGlobal. Keep it concrete: name the system, name the bottleneck, name the cost of inaction.",
    approach: [
      "TBD — top-level move we made (e.g. rebuilt the order flow on a new stack).",
      "TBD — second move (e.g. introduced an AI co-pilot for support agents).",
      "TBD — third move (e.g. shipped end-to-end in 4 sprints).",
    ],
    stack: ["TBD-Stack-1", "TBD-Stack-2", "TBD-Stack-3", "TBD-Stack-4"],
    results: [
      { value: "0", label: "TBD result label" },
      { value: "0", label: "TBD result label" },
      { value: "0", label: "TBD result label" },
    ],
    /* Featured = true means this case study gets the BorderBeam treatment
       on the /work index. Only ONE case study should be featured at a time;
       remove this flag from the other three once the boss picks the marquee. */
    featured: true,
    accentColor: "#4B28FF",
  },
  {
    slug: "medcollect",
    client: "Medcollect",
    industry: "TBD — Industry/Sector",
    outcome: "TBD — One-line outcome describing what we shipped and the result.",
    duration: "TBD weeks",
    challenge:
      "TBD — 2-3 sentences explaining what was broken or why the client came to TGlobal.",
    approach: [
      "TBD — top-level move 1.",
      "TBD — top-level move 2.",
      "TBD — top-level move 3.",
    ],
    stack: ["TBD-Stack-1", "TBD-Stack-2", "TBD-Stack-3"],
    results: [
      { value: "0", label: "TBD result label" },
      { value: "0", label: "TBD result label" },
      { value: "0", label: "TBD result label" },
    ],
    accentColor: "#bd70f6",
  },
  {
    slug: "jijibai",
    client: "JIJIBAI",
    industry: "TBD — Industry/Sector",
    outcome: "TBD — One-line outcome describing what we shipped and the result.",
    duration: "TBD weeks",
    challenge:
      "TBD — 2-3 sentences explaining what was broken or why the client came to TGlobal.",
    approach: [
      "TBD — top-level move 1.",
      "TBD — top-level move 2.",
      "TBD — top-level move 3.",
    ],
    stack: ["TBD-Stack-1", "TBD-Stack-2", "TBD-Stack-3"],
    results: [
      { value: "0", label: "TBD result label" },
      { value: "0", label: "TBD result label" },
      { value: "0", label: "TBD result label" },
    ],
    accentColor: "#fc5038",
  },
  {
    slug: "turpai",
    client: "Turpai",
    industry: "TBD — Industry/Sector",
    outcome: "TBD — One-line outcome describing what we shipped and the result.",
    duration: "TBD weeks",
    challenge:
      "TBD — 2-3 sentences explaining what was broken or why the client came to TGlobal.",
    approach: [
      "TBD — top-level move 1.",
      "TBD — top-level move 2.",
      "TBD — top-level move 3.",
    ],
    stack: ["TBD-Stack-1", "TBD-Stack-2", "TBD-Stack-3"],
    results: [
      { value: "0", label: "TBD result label" },
      { value: "0", label: "TBD result label" },
      { value: "0", label: "TBD result label" },
    ],
    accentColor: "#00a656",
  },
] as const;

/* ─── All clients (logo strip on /work index) ─────────────────────
   The full ten clients TGlobal has worked with. Phase 1 builds full
   case study pages for the top 4 (CASE_STUDIES above). The remaining
   six show as logo cards in the index — Phase 2 builds detail pages
   for them. */
export interface ClientLogo {
  readonly name: string;
  /** Optional slug if a /work/[slug] page exists for this client. */
  readonly slug?: string;
}

export const ALL_CLIENTS: readonly ClientLogo[] = [
  { name: "Skyline", slug: "skyline" },
  { name: "Medcollect", slug: "medcollect" },
  { name: "Odd Pieces" },
  { name: "RedPocket" },
  { name: "Dell" },
  { name: "Aliste Tech" },
  { name: "Jumbl" },
  { name: "JIJIBAI", slug: "jijibai" },
  { name: "Turpai", slug: "turpai" },
  { name: "Radhe Fashion" },
] as const;

/** Helper — finds a case study by slug, returns undefined if not found.
    Used by /work/[slug]/page.tsx during static param generation. */
export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((cs) => cs.slug === slug);
}

/** Helper — given a slug, returns the next case study in order
    (wrapping back to the first). Used for the "Next case →" card on
    the detail page. */
export function getNextCaseStudy(currentSlug: string): CaseStudy {
  const idx = CASE_STUDIES.findIndex((cs) => cs.slug === currentSlug);
  /* Wrap around — the LAST case study links back to the first so the
     user can keep cycling through. Better than a dead end. */
  const nextIdx = idx === -1 || idx === CASE_STUDIES.length - 1 ? 0 : idx + 1;
  return CASE_STUDIES[nextIdx]!;
}
