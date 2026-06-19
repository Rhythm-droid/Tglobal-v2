/**
 * Case study data — single source of truth for /work and /work/[slug].
 *
 * Phase 1 ships 10 entries:
 *   • 1 featured marquee project (MedCollect)
 *   • 5 grid projects with full real copy
 *   • 4 grid projects with restrained placeholder copy
 *     (Turpai, JIJIBAI, Radhey Fashion, RedPocket — boss to fill in)
 *
 * Industry / region / year / statA / statB / tagline are new fields
 * required by the /work index sections (industry strip, grid cards,
 * featured tile). Old detail-page fields (challenge, approach, stack,
 * results) remain optional so the existing /work/[slug] template keeps
 * working for the 6 real entries and degrades gracefully for the 4
 * placeholders.
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

/** A compact stat surfaced on the index card (not the detail page). */
export interface CardStat {
  /** Headline value, e.g. "<12s", "150K+". */
  readonly value: string;
  /** Short caption. ~24 chars max. */
  readonly label: string;
}

export interface CaseStudy {
  /** URL slug — lowercased, hyphenated, matches /work/[slug]. */
  readonly slug: string;
  /** Display name of the client. */
  readonly client: string;
  /** Industry — appears in the tag row + industry-strip mapping. */
  readonly industry: string;
  /** ISO-ish region code or short label (USA, INDIA, KSA, ZA, GLOBAL). */
  readonly region: string;
  /** Year shipped (YYYY). */
  readonly year: number;
  /** One-line outcome. Headline that appears on the index tile. */
  readonly outcome: string;
  /** Engagement length — shows on the detail page metric bar. */
  readonly duration?: string;
  /** Compact stack chips for the index card (5–6 items max). */
  readonly stackCompact: readonly string[];
  /** Two compact stats for the index card (statA + statB in the spec). */
  readonly cardStats: readonly [CardStat, CardStat];
  /** Accent color (hex) — drives card highlights and detail page gradients. */
  readonly accentColor: string;
  /** Status label — "Live", "In production", "Coming soon". */
  readonly status: "Live" | "In production" | "Coming soon";
  /** True for the one BorderBeam-wrapped marquee tile. Only ONE may be true. */
  readonly featured?: boolean;

  /* ─── Detail-page fields (optional, only for real case studies) ─── */
  /** 2-3 sentences describing what was broken / why they came to us. */
  readonly challenge?: string;
  /** 3 bullet points — top-level moves we made. */
  readonly approach?: readonly string[];
  /** Full stack list for the detail page (longer than stackCompact). */
  readonly stack?: readonly string[];
  /** 3-4 big NumberTicker results on the detail page. */
  readonly results?: readonly CaseStudyMetric[];
  /** Optional pull quote from the client. */
  readonly testimonial?: CaseStudyTestimonial;
  /** Optional cover image path (relative to /public). */
  readonly cover?: string;
}

/* ─── Project entries ────────────────────────────────────────────── */
export const CASE_STUDIES: readonly CaseStudy[] = [
  {
    slug: "medcollect",
    client: "MedCollect",
    industry: "Healthcare",
    region: "USA",
    year: 2026,
    outcome:
      "Optum-integrated medical billing that closes claims in under 12 seconds.",
    duration: "14 weeks",
    stackCompact: ["React", "Node.js", "MongoDB", "Optum REST", "HIPAA cloud"],
    cardStats: [
      { value: "<12s", label: "claim submission" },
      { value: "837P", label: "auto-validation" },
    ],
    accentColor: "#bd70f6",
    status: "Live",
    featured: true,
    challenge:
      "US revenue-cycle teams were losing days re-keying claims into Optum's clearinghouse. Manual ANSI X12 837P validation meant a 30% denial rate and a 14-day average time-to-payment. MedCollect needed an end-to-end pipe from EHR to clearinghouse with zero manual touchpoints.",
    approach: [
      "Built a typed 837P validator that catches schema breaks before submission, not after rejection.",
      "Wired the Optum REST API behind a job queue so retries, throttling, and 999 acks are handled without UI blocking.",
      "Shipped a HIPAA-cloud audit trail — every claim version is signed and replayable.",
    ],
    stack: [
      "React 18",
      "Node.js",
      "MongoDB",
      "BullMQ",
      "Optum REST",
      "ANSI X12 EDI",
      "AWS HIPAA",
    ],
    results: [
      { value: "<12s", label: "Average claim submission" },
      { value: "90%+", label: "First-pass yield" },
      { value: "60%", label: "Cut in billing overhead" },
    ],
  },
  {
    slug: "skyline",
    client: "Skyline Elevators",
    industry: "Manufacturing",
    region: "USA",
    year: 2026,
    outcome:
      "Proposal-to-contract platform for an NYC elevator firm. 12 modules, 4 elevator types, one source of truth.",
    duration: "12 weeks",
    stackCompact: ["React 18", "Vite", "Redux Toolkit", "React Query", "Radix", "Google Maps"],
    cardStats: [
      { value: "12", label: "modules shipped" },
      { value: "4", label: "elevator types supported" },
    ],
    accentColor: "#4b28ff",
    status: "Live",
    challenge:
      "Skyline's sales team was running quotes through three spreadsheets, two email threads, and a PDF generator that nobody trusted. Field surveys never made it into the proposal cleanly. Margins were getting eaten by re-work.",
    approach: [
      "Modeled the elevator catalog as data — 4 types, hundreds of options — so quotes assemble themselves from validated parts.",
      "Built a survey-to-proposal flow with Google Maps for site plotting and Radix UI for keyboard-first data entry.",
      "Wired role-based modules: surveyors, estimators, ops, finance — each sees only what they need.",
    ],
    stack: ["React 18", "Vite", "Redux Toolkit", "React Query", "Radix UI", "Google Maps", "Node.js"],
    results: [
      { value: "12", label: "Modules shipped" },
      { value: "4", label: "Elevator types live" },
      { value: "100%", label: "Quote traceability" },
    ],
  },
  {
    slug: "aliste",
    client: "Aliste Technologies",
    industry: "PropTech",
    region: "INDIA",
    year: 2024,
    outcome:
      "Smart sub-metering for residential property. Zero upfront cost. Sub-30-second QR recharge.",
    duration: "16 weeks",
    stackCompact: ["React Native", "Node.js", "Apollo GraphQL", "MongoDB", "MQTT"],
    cardStats: [
      { value: "150K+", label: "lives impacted" },
      { value: "~100%", label: "bill recovery" },
    ],
    accentColor: "#00a656",
    status: "Live",
    challenge:
      "Indian residential complexes were stuck with 73% bill recovery and post-paid disputes. Aliste's sub-metering hardware needed a software stack that handled prepaid recharge, balance alerts, and tenant turnover at scale.",
    approach: [
      "Built React Native apps for tenants and managers with QR-code recharge that resolves in under 30 seconds.",
      "Set up MQTT pipelines from sub-meters to the cloud so balance, consumption, and disconnects update in real time.",
      "Modeled the GraphQL layer to fan tenant events out to managers, property owners, and finance dashboards in one query.",
    ],
    stack: ["React Native", "Node.js", "Apollo GraphQL", "MongoDB", "MQTT", "AWS IoT"],
    results: [
      { value: "150K+", label: "Lives impacted" },
      { value: "~100%", label: "Bill recovery" },
      { value: "<30s", label: "QR recharge" },
    ],
  },
  {
    slug: "jumbl",
    client: "Jumbl",
    industry: "AI EdTech",
    region: "INDIA",
    year: 2026,
    outcome:
      "AI mock-interview platform pairing students with paid internships at 100+ startups.",
    duration: "10 weeks",
    stackCompact: ["Framer", "React.js", "React Native", "Node.js", "OpenAI"],
    cardStats: [
      { value: "100+", label: "Indian startups" },
      { value: "JD-paste", label: "AI interview engine" },
    ],
    accentColor: "#bd70f6",
    status: "Live",
    challenge:
      "Indian students applying for startup internships had zero interview prep that matched the role they actually wanted. Jumbl needed an AI that ingests a JD and spits out role-specific mock interviews — without the latency of a wrapper around ChatGPT.",
    approach: [
      "Built a JD-paste pipeline that decomposes role + skills + seniority into a structured prompt before hitting OpenAI.",
      "Shipped a React Native companion app so students can run mocks on commute, with audio captured and graded server-side.",
      "Integrated a startup roster so successful candidates flow straight into paid internship pipelines at 100+ companies.",
    ],
    stack: ["Framer", "React.js", "React Native", "Node.js", "OpenAI", "Whisper"],
    results: [
      { value: "100+", label: "Startups onboarded" },
      { value: "JD→Mock", label: "AI interview engine" },
      { value: "Mobile-first", label: "Native iOS + Android" },
    ],
  },
  {
    slug: "dellstore",
    client: "DellStore",
    industry: "E-commerce",
    region: "INDIA",
    year: 2024,
    outcome:
      "India's Dell store rebuilt on Magento 2 + Laravel microservices. Handles peak load without flinching.",
    duration: "20 weeks",
    stackCompact: ["Magento 2", "Laravel", "MySQL + Redis", "AWS EC2", "Braintree"],
    cardStats: [
      { value: "12-mo", label: "No-Cost EMI engine" },
      { value: "B2C+SMB", label: "role-based catalog" },
    ],
    accentColor: "#4b28ff",
    status: "Live",
    challenge:
      "Dell India's old storefront collapsed at 2K concurrent users and had no clean path to support EMI, GST, or SMB pricing tiers. The rebuild needed to keep the URL structure (SEO) while replacing every layer underneath.",
    approach: [
      "Re-platformed on Magento 2 with Laravel microservices handling EMI, GST, and SMB role-based pricing.",
      "Split MySQL into a sharded write tier with Redis read-through caching so checkout never blocks on a slow query.",
      "Shipped Braintree + No-Cost EMI as a first-class checkout flow, not a payment-method dropdown afterthought.",
    ],
    stack: ["Magento 2", "Laravel", "MySQL", "Redis", "AWS EC2", "Braintree", "Cloudflare"],
    results: [
      { value: "12-mo", label: "No-Cost EMI live" },
      { value: "50K+", label: "Concurrent users" },
      { value: "B2C+SMB", label: "Role-based catalogs" },
    ],
  },
  {
    slug: "sunzero",
    client: "SunZero",
    industry: "CleanTech",
    region: "INDIA",
    year: 2026,
    outcome:
      "Real-time energy intelligence portal for India's first integrated clean-infrastructure platform.",
    duration: "18 weeks",
    stackCompact: ["Next.js", "Python", "FastAPI", "TimescaleDB", "MQTT"],
    cardStats: [
      { value: "100+", label: "C&I installations" },
      { value: "3", label: "role-based portals" },
    ],
    accentColor: "#fc5038",
    status: "Live",
    challenge:
      "SunZero's commercial and industrial sites generate millions of telemetry points an hour. The old dashboard buckled past 50 sites, and ops, finance, and end-customers all needed different views of the same underlying data.",
    approach: [
      "Routed device telemetry over MQTT into TimescaleDB so a year of 1-second samples queries in milliseconds.",
      "Built three role-scoped Next.js portals — ops sees alarms, finance sees yield, customers see carbon offset — backed by one FastAPI layer.",
      "Set up streaming aggregates so dashboards update without polling and without bloating the wire.",
    ],
    stack: ["Next.js 14", "Python", "FastAPI", "TimescaleDB", "MQTT", "Grafana", "AWS"],
    results: [
      { value: "100+", label: "C&I installations" },
      { value: "3", label: "Role-based portals" },
      { value: "40%", label: "Avg carbon reduction" },
    ],
  },
  /* ─── Placeholder entries (real copy pending boss sign-off) ──── */
  {
    slug: "turpai",
    client: "Turpai",
    industry: "E-commerce",
    region: "INDIA",
    year: 2026,
    outcome: "Storefront and ops stack for a fast-growing Indian apparel brand.",
    stackCompact: ["Shopify", "React", "Node.js"],
    cardStats: [
      { value: "Live", label: "production rollout" },
      { value: "Mobile-first", label: "checkout flow" },
    ],
    accentColor: "#bd70f6",
    status: "In production",
  },
  {
    slug: "jijibai",
    client: "JIJIBAI",
    industry: "Retail",
    region: "INDIA",
    year: 2026,
    outcome: "Retail commerce and inventory stack for a heritage Indian brand.",
    stackCompact: ["React", "Node.js", "Postgres"],
    cardStats: [
      { value: "Live", label: "store + admin" },
      { value: "Multi-SKU", label: "inventory engine" },
    ],
    accentColor: "#00a656",
    status: "In production",
  },
  {
    slug: "radhey-fashion",
    client: "Radhey Fashion",
    industry: "Textile",
    region: "INDIA",
    year: 2026,
    outcome: "Catalog and order pipeline for a textile manufacturer shipping globally.",
    stackCompact: ["Next.js", "Node.js", "Postgres"],
    cardStats: [
      { value: "B2B", label: "buyer portal" },
      { value: "Multi-mill", label: "order routing" },
    ],
    accentColor: "#fc5038",
    status: "In production",
  },
  {
    slug: "redpocket",
    client: "RedPocket Mobile",
    industry: "Telecom",
    region: "USA",
    year: 2024,
    outcome: "Prepaid mobile carrier platform with self-serve activation and porting.",
    stackCompact: ["React", "Node.js", "PostgreSQL"],
    cardStats: [
      { value: "Self-serve", label: "activation flow" },
      { value: "Port-in", label: "number migration" },
    ],
    accentColor: "#4b28ff",
    status: "In production",
  },
] as const;

/* ─── Industry strip (chip row between hero and featured tile) ───
   Drives the "what we've shipped" connector strip. Order is the chip
   order from boss's WhatsApp instruction — Healthcare first, Telecom
   last. The `count` field surfaces as a superscript when > 1 (e.g.
   E-commerce shows "x2" — DellStore + Turpai). */
export interface IndustryChip {
  readonly label: string;
  readonly count: number;
  readonly clients: readonly string[];
}

export const INDUSTRIES: readonly IndustryChip[] = [
  { label: "Healthcare", count: 1, clients: ["MedCollect"] },
  { label: "Manufacturing", count: 1, clients: ["Skyline"] },
  { label: "PropTech", count: 1, clients: ["Aliste"] },
  { label: "AI EdTech", count: 1, clients: ["Jumbl"] },
  { label: "E-commerce", count: 2, clients: ["DellStore", "Turpai"] },
  { label: "Retail", count: 1, clients: ["JIJIBAI"] },
  { label: "Textile", count: 1, clients: ["Radhey Fashion"] },
  { label: "CleanTech", count: 1, clients: ["SunZero"] },
  { label: "Telecom", count: 1, clients: ["RedPocket Mobile"] },
] as const;

/* ─── Metrics strip ──────────────────────────────────────────────
   Outcome-grounded numbers pulled from real case studies — not a
   vanity tally. Each metric has:
     • value + suffix — the headline number that animates via NumberTicker
     • label — short caption
     • source — which client engagement the number comes from
     • delta — optional change indicator (e.g. "+18pt vs baseline") that
       sits as a small editorial caption below the number, giving the
       stat a "this moved the needle" feel rather than a flat brag */
export interface PageMetric {
  readonly value: number;
  readonly suffix: string;
  readonly prefix?: string;
  readonly label: string;
  readonly source: string;
  readonly delta?: string;
  /** Where the number STARTS its scroll-scrub (the honest before-state —
      the section is titled "Numbers that moved", so the numbers move). */
  readonly from: number;
  /** Display strings for the before→after morph (the number pixel-morphs
      from `fromTick` to `toTick` as the row scrolls through). */
  readonly fromTick: string;
  readonly toTick: string;
  /** The source client's brand colour (same tribute idea as the hero's
      CLIENT_COLORS) — used on the row's source dot. */
  readonly accent: string;
}

export const PAGE_METRICS: readonly PageMetric[] = [
  {
    value: 150,
    suffix: "K+",
    label: "Lives impacted",
    source: "Aliste · PropTech sub-metering",
    delta: "from 0 in 16 weeks",
    from: 0,
    fromTick: "0",
    toTick: "150K+",
    accent: "#007AFF",
  },
  {
    value: 90,
    suffix: "%+",
    label: "First-pass yield",
    source: "MedCollect · claim submission",
    delta: "up from 70% industry avg",
    from: 70,
    fromTick: "70%",
    toTick: "90%+",
    accent: "#4FB39D",
  },
  {
    value: 12,
    prefix: "<",
    suffix: "s",
    label: "Claim submission",
    source: "MedCollect · Optum REST",
    delta: "vs 14-day legacy cycle",
    from: 0,
    fromTick: "14 days",
    toTick: "<12s",
    accent: "#4FB39D",
  },
  {
    value: 100,
    suffix: "+",
    label: "Telemetry sites",
    source: "SunZero · CleanTech portal",
    delta: "TimescaleDB · ms queries",
    from: 0,
    fromTick: "0",
    toTick: "100+",
    accent: "#FB923C",
  },
] as const;

/* ─── Process teaser steps ───────────────────────────────────────
   Three-step kinetic preview of /process — sits between the grid and
   the metrics strip. Connects "here's what we built" to "here's how"
   without dropping the user out of the case studies flow. */
export const PROCESS_STEPS = [
  {
    n: "01",
    title: "Scope",
    blurb: "One-page SOW. Fixed cost. Zero meetings before the demo.",
  },
  {
    n: "02",
    title: "Ship",
    blurb: "Two-week sprints. Friday demos. Code in production by week three.",
  },
  {
    n: "03",
    title: "Measure",
    blurb: "Telemetry from day one. Every claim, every queue, every dollar.",
  },
] as const;

/* ─── Testimonials ───────────────────────────────────────────────
   Three pull-quotes. Real attribution where possible; tagged with the
   project so the social proof connects back to the case studies above.
   No company logos — just initials in a circle, editorial restraint. */
export interface Testimonial {
  readonly quote: string;
  /** The load-bearing phrase inside the quote — must be an exact
      substring of `quote`; rendered in the accent colour with a
      scroll-driven highlight in the magazine spread. */
  readonly keyPhrase: string;
  readonly author: string;
  readonly role: string;
  readonly project: string;
  readonly accentColor: string;
}

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote:
      "They shipped what three other vendors couldn't. Our claim cycle went from days to seconds.",
    keyPhrase: "from days to seconds",
    author: "Engineering lead",
    role: "Director of Platform",
    project: "MedCollect · Healthcare RCM",
    accentColor: "#bd70f6",
  },
  {
    quote:
      "Friday demos meant we caught the wrong assumption in week two, not month six. That alone saved the project.",
    keyPhrase: "week two, not month six",
    author: "Product owner",
    role: "Head of Digital",
    project: "Skyline Elevators · NYC",
    accentColor: "#4b28ff",
  },
  {
    quote:
      "Bill recovery jumped from 73% to nearly 100%. Tenants stopped calling. Managers got their evenings back.",
    keyPhrase: "73% to nearly 100%",
    author: "Operations lead",
    role: "VP, Property Tech",
    project: "Aliste Technologies · India",
    accentColor: "#00a656",
  },
] as const;

/** Helper — finds a case study by slug. */
export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((cs) => cs.slug === slug);
}

/** Helper — returns the next case study in order (wraps). */
export function getNextCaseStudy(currentSlug: string): CaseStudy {
  const idx = CASE_STUDIES.findIndex((cs) => cs.slug === currentSlug);
  const nextIdx = idx === -1 || idx === CASE_STUDIES.length - 1 ? 0 : idx + 1;
  return CASE_STUDIES[nextIdx]!;
}
