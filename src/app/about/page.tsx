import type { Metadata } from "next";
import Link from "next/link";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  AnimateIn,
  BentoGrid,
  BentoTile,
  MagicCard,
  NumberTicker,
  WordReveal,
} from "@/components/primitives";
import { cn } from "@/lib/cn";

/**
 * /about — Editorial manifesto (no team photos).
 *
 * Direction A from the design brief: bold typography, founder voice
 * paragraphs, team listed as text rows. The "no photos" constraint is
 * not a limitation — it shifts the page's identity from a corporate
 * leadership team layout to an editorial mission statement, which fits
 * TGlobal's positioning ("we ship outcomes, not headshots") better
 * than a generic team grid would.
 *
 * Section flow (top → bottom):
 *   1. HERO — echo of the homepage hero phrasing, signaling brand
 *      consistency. Italic serif accent on the differentiator word.
 *   2. MANIFESTO — 4 short paragraphs in the founder's voice, each
 *      revealed word-by-word as the section enters the viewport.
 *      Serif italics highlight the key conviction in each paragraph.
 *   3. TEAM — text rows. No photos, no avatars. Each row is a
 *      hoverable line: name → role → 1-line bio. Animated underline
 *      sweep on hover provides visual interest without faces.
 *   4. VALUES BENTO — 3 tiles with "01/02/03" big numerals + value
 *      name + paragraph. Magic card hover treatment.
 *   5. STATS BAR — NumberTicker on the headline numbers. Builds
 *      authority without specific named clients in the copy.
 *   6. CTA — "Want to work with us?" → /contact.
 *
 * Server component throughout. Interactive primitives (WordReveal,
 * MagicCard, NumberTicker, AnimateIn) carry their own client-side
 * directives so hydration is per-piece.
 */

export const metadata: Metadata = {
  title: "About",
  description:
    "How TGlobal works: outcomes per sprint, not hours per week. Our manifesto, our team, our numbers.",
  alternates: { canonical: "https://tglobal.in/about" },
  openGraph: {
    title: "About · TGlobal",
    description:
      "Outcomes per sprint, not hours per week. Our manifesto, our team, our numbers.",
    url: "https://tglobal.in/about",
  },
};

/* ─── Editable content blocks ─────────────────────────────────────
   Keep all copy in one place near the top so non-engineers can edit
   later without wading through JSX. Type-locked so missing fields
   fail at build time rather than rendering blank. */

interface ManifestoEntry {
  /** The conviction — the bolded italic accent. */
  readonly conviction: string;
  /** The body — sentence(s) explaining/expanding the conviction. */
  readonly body: string;
}

const MANIFESTO: readonly ManifestoEntry[] = [
  {
    conviction: "Outcomes, not hours.",
    body: "We don't bill engineering time. We commit to outcomes per sprint, and we eat the overruns when they happen. The cost of leaving is the same as the cost of staying — that's the contract.",
  },
  {
    conviction: "Small teams, big surface area.",
    body: "Our agent stack lets a team of three deliver what a traditional team of fifteen usually does. The combination of human judgment and AI execution is why founders trust us with deadlines they wouldn't give a vendor.",
  },
  {
    conviction: "Discovery is short. Shipping is fast.",
    body: "One week to scope. Two-week sprints to ship. No discovery decks that take three months. No prototypes that never make it to production. The only artifact is working software you own from day one.",
  },
  {
    conviction: "We don't build dependencies.",
    body: "Code, docs, and infrastructure are yours from sprint one. There is nothing locking you in. If you want to take it in-house after the first sprint, we'll hand it over and write the runbook for the engineer replacing us.",
  },
] as const;

interface TeamMember {
  readonly name: string;
  readonly role: string;
  readonly bio: string;
}

/* Placeholder team — replace with real names + roles + bios.
   No photos required by design (Option A). Each row hovers with a
   purple underline sweep so the section feels alive on cursor. */
const TEAM: readonly TeamMember[] = [
  {
    name: "TBD — Founder name",
    role: "Founder & Engineering Lead",
    bio: "Ships systems, not slide decks. ~12 years across fintech, retail, healthcare.",
  },
  {
    name: "TBD — Co-founder name",
    role: "Co-founder & Operations",
    bio: "Keeps every sprint on the rails. Former PM at TBD-Company.",
  },
  {
    name: "TBD — Engineer name",
    role: "Senior Engineer",
    bio: "Full-stack. Lives at the seam between AI agents and shipped product.",
  },
  {
    name: "TBD — Engineer name",
    role: "Senior Engineer",
    bio: "Frontend craftsperson. Cares deeply about the details users feel.",
  },
];

interface ValueEntry {
  readonly numeral: string;
  readonly name: string;
  readonly description: string;
}

const VALUES: readonly ValueEntry[] = [
  {
    numeral: "01",
    name: "Speed is the feature",
    description:
      "A two-week sprint that ships beats a three-month plan that lingers. Every decision should accelerate the next one.",
  },
  {
    numeral: "02",
    name: "Agency is the moat",
    description:
      "We use AI to multiply what humans decide, not replace the deciding. Judgment is the bottleneck — the rest is execution.",
  },
  {
    numeral: "03",
    name: "Plain speech wins",
    description:
      "If a feature can't be explained in one sentence, it shouldn't be built yet. Same for emails, docs, contracts, and walls.",
  },
];

interface Stat {
  /** Final value the NumberTicker counts up to. */
  readonly value: number;
  /** Label below the number. */
  readonly label: string;
  /** Optional suffix (e.g. "+", "%", "x"). */
  readonly suffix?: string;
}

const STATS: readonly Stat[] = [
  { value: 10, label: "Clients shipped" },
  { value: 4, label: "Countries", suffix: "+" },
  { value: 6, label: "Years building", suffix: "+" },
  { value: 4, label: "Sprint speed multiplier", suffix: "×" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* ─── HERO ─────────────────────────────────────────────
            Echo of homepage phrasing. Same italic serif treatment for
            "build" so visitors see brand consistency immediately. */}
        <section
          aria-label="About TGlobal"
          className="relative overflow-hidden bg-white pt-32 sm:pt-40 lg:pt-48 pb-20 sm:pb-28 lavender-wash"
        >
          <div className="relative mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
              About TGlobal
            </p>
            <h1
              className="mt-6 max-w-5xl font-medium leading-[1.02] text-foreground"
              style={{
                fontSize: "clamp(48px, 8vw, 120px)",
                letterSpacing: "-0.06em",
              }}
            >
              We{" "}
              <span
                className="italic"
                style={{
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                }}
              >
                build
              </span>{" "}
              software, without the friction.
            </h1>
            <div className="mt-10 max-w-3xl">
              <WordReveal
                text="A small team of engineers and operators that ships full systems in sprints, not quarters. AI-native execution with humans on every decision."
                as="p"
                className="text-xl sm:text-2xl font-normal leading-relaxed text-foreground-mid"
                stagger={0.025}
              />
            </div>
          </div>
        </section>

        {/* ─── MANIFESTO ────────────────────────────────────────
            4 conviction-led paragraphs. Each entry's first words are
            an italic serif accent — the conviction. The body follows
            in the page's standard sans. WordReveal staggers the body
            text per scroll, so the manifesto reveals like an editorial
            essay being typeset for the reader. */}
        <section
          aria-labelledby="manifesto-heading"
          className="bg-background py-24 sm:py-32"
        >
          <div className="mx-auto w-full max-w-[1240px] px-6 sm:px-8 lg:px-14 xl:px-20">
            <h2
              id="manifesto-heading"
              className="text-sm font-medium uppercase tracking-[0.18em] text-muted"
            >
              The manifesto
            </h2>

            <div className="mt-16 space-y-20 sm:space-y-28">
              {MANIFESTO.map((entry, idx) => (
                <AnimateIn key={entry.conviction} y={28} delay={idx * 0.08}>
                  <article className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left rail — the conviction in italic serif.
                        On wide screens it sits in its own column; on
                        narrow it sits above the body. */}
                    <h3
                      className="lg:col-span-5 italic font-medium text-foreground leading-[1.05]"
                      style={{
                        fontFamily:
                          "var(--font-instrument-serif), Georgia, serif",
                        fontSize: "clamp(32px, 4.4vw, 64px)",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {entry.conviction}
                    </h3>
                    {/* Right rail — body sentence(s) revealed word-by-word. */}
                    <div className="lg:col-span-7">
                      <WordReveal
                        text={entry.body}
                        as="p"
                        className="text-lg sm:text-xl font-normal leading-relaxed text-foreground-mid"
                        stagger={0.02}
                      />
                    </div>
                  </article>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TEAM (text rows, no photos) ──────────────────────
            Designed without faces by intention. Each row is a flex
            line: name (left, large), role (center, muted), bio
            (right, body). Hover triggers a left-border accent + name
            slide. Reads as a typographic table of contents — feels
            considered rather than missing-photos. */}
        <section
          aria-labelledby="team-heading"
          className="bg-surface border-y border-border py-24 sm:py-32"
        >
          <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
              <div className="lg:col-span-5">
                <h2
                  id="team-heading"
                  className="text-sm font-medium uppercase tracking-[0.18em] text-muted"
                >
                  The team
                </h2>
                <p
                  className="mt-6 font-medium leading-[1.05] text-foreground"
                  style={{
                    fontSize: "clamp(36px, 4.8vw, 64px)",
                    letterSpacing: "-0.04em",
                  }}
                >
                  Small enough to know your roadmap.
                </p>
              </div>
              <div className="lg:col-span-7">
                <p className="text-lg sm:text-xl text-foreground-mid leading-relaxed">
                  No staff augmentation. No bench engineers we&apos;ve never met.
                  Every name below is on every project, by name.
                </p>
              </div>
            </div>

            <ul
              className="mt-14 divide-y divide-border border-y border-border"
              role="list"
            >
              {TEAM.map((member, idx) => (
                <AnimateIn key={member.name + idx} y={20} delay={idx * 0.06}>
                  <li
                    /* Group enables the hover affordance below. The
                       transition + hover translate gives the row a
                       gentle right-shift on cursor — affordance without
                       requiring photos. */
                    className="group relative grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6 py-8 sm:py-10 transition-all duration-300 hover:pl-6"
                  >
                    {/* Left accent bar — invisible at rest, slides in
                        from the left on hover. The "in lieu of a photo"
                        affordance: it gives the row a visual focal point
                        when interacted with. */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute left-0 top-1/2 h-0 w-1 -translate-y-1/2 bg-primary transition-all duration-300 group-hover:h-full"
                    />

                    {/* Name — large editorial type */}
                    <h3
                      className="sm:col-span-5 font-medium tracking-[-0.04em] text-foreground transition-colors group-hover:text-primary"
                      style={{ fontSize: "clamp(22px, 2.4vw, 32px)" }}
                    >
                      {member.name}
                    </h3>
                    {/* Role — small caps muted */}
                    <p
                      className="sm:col-span-3 text-base sm:text-lg text-muted self-center"
                    >
                      {member.role}
                    </p>
                    {/* Bio — body text */}
                    <p className="sm:col-span-4 text-base sm:text-lg text-foreground-mid leading-relaxed self-center">
                      {member.bio}
                    </p>
                  </li>
                </AnimateIn>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── VALUES BENTO ─────────────────────────────────────
            3 tiles, each with a giant numeral, the value name, and a
            paragraph. MagicCard gives them cursor-tracking glow. */}
        <section
          aria-labelledby="values-heading"
          className="bg-background py-24 sm:py-32"
        >
          <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
            <h2
              id="values-heading"
              className="text-sm font-medium uppercase tracking-[0.18em] text-muted"
            >
              How we operate
            </h2>
            <p
              className="mt-6 max-w-3xl font-medium leading-tight text-foreground"
              style={{
                fontSize: "clamp(32px, 4.4vw, 56px)",
                letterSpacing: "-0.04em",
              }}
            >
              The values that govern every sprint.
            </p>

            <BentoGrid columns={3} className="mt-14 gap-5 sm:gap-6">
              {VALUES.map((value, idx) => (
                <BentoTile key={value.numeral} className="min-h-[280px]">
                  <AnimateIn y={20} delay={idx * 0.08}>
                    <MagicCard className="h-full p-8 sm:p-10">
                      {/* Big numeral — italic serif, brand-purple. The
                          numbers do the heavy visual lifting in a
                          photo-less layout. */}
                      <span
                        aria-hidden
                        className="block italic text-primary"
                        style={{
                          fontFamily:
                            "var(--font-instrument-serif), Georgia, serif",
                          fontSize: "clamp(64px, 7vw, 96px)",
                          lineHeight: 1,
                          letterSpacing: "-0.04em",
                        }}
                      >
                        {value.numeral}
                      </span>
                      <h3
                        className="mt-6 font-medium tracking-[-0.03em] text-foreground"
                        style={{ fontSize: "clamp(22px, 2.2vw, 28px)" }}
                      >
                        {value.name}
                      </h3>
                      <p className="mt-4 text-base sm:text-lg leading-relaxed text-foreground-mid">
                        {value.description}
                      </p>
                    </MagicCard>
                  </AnimateIn>
                </BentoTile>
              ))}
            </BentoGrid>
          </div>
        </section>

        {/* ─── STATS BAR ────────────────────────────────────────
            NumberTicker counts each stat from 0 → target on scroll.
            Without team photos, the numbers carry the "this is a real
            company" signal. Pair with descriptive labels so the value
            is unambiguous. */}
        <section
          aria-labelledby="stats-heading"
          className="bg-foreground text-background py-24 sm:py-28"
        >
          <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
            <h2
              id="stats-heading"
              className="text-sm font-medium uppercase tracking-[0.18em] text-background/60"
            >
              By the numbers
            </h2>

            <dl className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12">
              {STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-2">
                  <dt
                    className="font-medium leading-[0.9] text-background"
                    style={{
                      fontSize: "clamp(56px, 7vw, 96px)",
                      letterSpacing: "-0.05em",
                    }}
                  >
                    <NumberTicker value={stat.value} suffix={stat.suffix ?? ""} />
                  </dt>
                  <dd className="text-base sm:text-lg text-background/70 leading-snug">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ─── CLOSING CTA ──────────────────────────────────────
            Same visual language as the /work CTA — consistency builds
            trust as the visitor moves through the site. */}
        <section className="bg-background py-20 sm:py-28">
          <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
            <div
              className={cn(
                "rounded-[32px] bg-primary px-8 py-16 sm:px-16 sm:py-24 text-white relative overflow-hidden",
              )}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-accent-violet opacity-50"
                style={{ filter: "blur(140px)" }}
              />
              <div className="relative max-w-3xl">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/70">
                  Working with us
                </p>
                <h2
                  className="mt-4 font-medium leading-[1.05] text-white"
                  style={{
                    fontSize: "clamp(32px, 5vw, 64px)",
                    letterSpacing: "-0.04em",
                  }}
                >
                  Let&apos;s talk about what you&apos;re trying to{" "}
                  <span
                    className="italic"
                    style={{
                      fontFamily:
                        "var(--font-instrument-serif), Georgia, serif",
                    }}
                  >
                    ship
                  </span>
                  .
                </h2>
                <p className="mt-6 text-lg sm:text-xl text-white/90 max-w-2xl leading-relaxed">
                  We respond to every inquiry within 48 hours with a discovery
                  call slot or a referral if we&apos;re not the right fit.
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link
                    href="/contact"
                    className="pill bg-white text-primary hover:bg-white/90 focus-ring inline-flex"
                  >
                    Start a conversation
                  </Link>
                  <Link
                    href="/work"
                    className="pill border border-white/30 text-white hover:bg-white/10 focus-ring inline-flex"
                  >
                    See our work
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
