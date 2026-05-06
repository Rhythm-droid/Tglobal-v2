import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  AnimateIn,
  MagicCard,
  WordReveal,
} from "@/components/primitives";

/**
 * /process — How we work, step by step.
 *
 * Section flow:
 *   1. HERO — "We work in sprints, not hours." + WordReveal subhead.
 *   2. 5-STEP TIMELINE — vertical timeline with a brand-purple line
 *      connecting each step. Each step shows: numeral, name, body,
 *      deliverable list. Steps reveal sequentially on scroll via
 *      AnimateIn so the page composes itself as the reader descends.
 *   3. SPRINT ANATOMY — horizontal day-by-day breakdown of a single
 *      two-week sprint. Helps visitors understand what they'd actually
 *      experience hour by hour.
 *   4. TOOLS — small strip naming the tooling we use, demystifying
 *      "AI-native" without leaning on jargon.
 *   5. CLOSING CTA — same pattern as /work and /about.
 *
 * Why a CSS-line vertical timeline (not GSAP scroll-pin):
 *   The original plan called for a GSAP-pinned vertical stepper where
 *   each step locks the viewport while content morphs. That pattern
 *   is fragile on iOS (Safari ignores `position: sticky` inside scroll
 *   transforms) and overkill for a five-step list. A static vertical
 *   timeline with per-step reveal-on-scroll communicates the same
 *   "linear progression" without breaking on real devices.
 *
 * Server component throughout. Animations come from the primitives
 * (WordReveal, AnimateIn, MagicCard).
 */

export const metadata: Metadata = {
  title: "How we work",
  description:
    "Sprints, not quarters. A week to scope, two weeks to ship. Here's exactly how a TGlobal engagement runs from first call to live system.",
  alternates: { canonical: "https://tglobal.in/process" },
  openGraph: {
    title: "How we work · TGlobal",
    description:
      "A week to scope. Two weeks to ship. Here's exactly how every engagement runs.",
    url: "https://tglobal.in/process",
  },
};

/* ─── Editable content ──────────────────────────────────────────── */

interface ProcessStep {
  readonly numeral: string;
  readonly name: string;
  readonly duration: string;
  readonly body: string;
  readonly deliverables: readonly string[];
}

const STEPS: readonly ProcessStep[] = [
  {
    numeral: "01",
    name: "Discovery",
    duration: "1 week",
    body: "We sit with your team and map the system. No discovery deck. No three-month research phase. We look at the code, the metrics, the user research you already have, and write a one-page statement of work the same week.",
    deliverables: [
      "One-page scope document",
      "Fixed sprint cost",
      "Risks and dependencies named upfront",
    ],
  },
  {
    numeral: "02",
    name: "Sprint zero",
    duration: "Days 1–3",
    body: "Repos, environments, deploy pipelines, error tracking, telemetry. Set up before any feature work so we never block on infra. AI agents wired into the stack from day one.",
    deliverables: [
      "Production + staging environments",
      "CI/CD running",
      "Observability dashboards live",
    ],
  },
  {
    numeral: "03",
    name: "Build sprints",
    duration: "Two-week cycles",
    body: "Two-week cycles end-to-end. Each sprint ships a vertical slice — front to back, deployed, observable. Daily standups are async. Weekly demos are live. No sprint stretches without explicit re-scoping.",
    deliverables: [
      "Working software, deployed",
      "Live demos every Friday",
      "Async progress notes daily",
    ],
  },
  {
    numeral: "04",
    name: "Ship",
    duration: "End of each sprint",
    body: "Every sprint ends with a deploy to production behind a feature flag. You decide when it goes live to users. We handle migrations, rollbacks, and on-call rotation through the launch window.",
    deliverables: [
      "Production deploy with feature flags",
      "Migration playbook",
      "Launch-window on-call coverage",
    ],
  },
  {
    numeral: "05",
    name: "Hand-off (or keep going)",
    duration: "When you're ready",
    body: "Code, docs, and infrastructure are yours from day one. If you want to take it in-house after sprint one, we hand it over and write the runbook for the engineer replacing us. If you want to keep going, we re-scope the next sprint within 48 hours.",
    deliverables: [
      "Full runbook + architecture docs",
      "Two weeks' notice between sprints",
      "Same cost to leave or stay",
    ],
  },
];

interface SprintDay {
  readonly day: string;
  readonly focus: string;
}

const SPRINT_ANATOMY: readonly SprintDay[] = [
  { day: "Mon W1", focus: "Sprint kickoff. Scope locked. Tickets in flight." },
  { day: "Tue W1", focus: "Vertical slice begins. Backend + frontend in parallel." },
  { day: "Wed W1", focus: "First integration test. Async progress note posted." },
  { day: "Thu W1", focus: "Mid-sprint check-in. Re-scope if anything's shifted." },
  { day: "Fri W1", focus: "Demo on staging. Walkthrough recorded for the team." },
  { day: "Mon W2", focus: "Edge cases + performance. Telemetry hooks added." },
  { day: "Tue W2", focus: "Code review intensive. Test coverage to target." },
  { day: "Wed W2", focus: "Docs written. Runbook updated. Bug bash." },
  { day: "Thu W2", focus: "Production deploy behind feature flag." },
  { day: "Fri W2", focus: "Live demo. Sprint review. Plan next sprint." },
];

const TOOLS: readonly string[] = [
  "Next.js",
  "TypeScript",
  "Node.js",
  "Postgres",
  "Vercel / Cloudflare",
  "OpenAI · Anthropic · Mistral",
  "Stripe",
  "Linear",
  "GitHub",
  "Sentry",
];

export default function ProcessPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* ─── HERO ─────────────────────────────────────────────
            Same lavender-wash treatment as /about so the two pages
            feel like sister chapters of the same book. */}
        <section
          aria-label="How we work"
          className="relative overflow-hidden bg-white pt-32 sm:pt-40 lg:pt-48 pb-20 sm:pb-28 lavender-wash"
        >
          <div className="relative mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
              How we work
            </p>
            <h1
              className="mt-6 max-w-5xl font-medium leading-[1.0] text-foreground"
              style={{
                fontSize: "clamp(48px, 8vw, 120px)",
                letterSpacing: "-0.06em",
              }}
            >
              Sprints,{" "}
              <span
                className="italic"
                style={{
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                }}
              >
                not
              </span>{" "}
              quarters.
            </h1>
            <div className="mt-10 max-w-3xl">
              <WordReveal
                text="A week to scope. Two weeks to ship. No discovery decks. No prototypes that never make production. The artifact is working software you own."
                as="p"
                className="text-xl sm:text-2xl font-normal leading-relaxed text-foreground-mid"
                stagger={0.025}
              />
            </div>
          </div>
        </section>

        {/* ─── 5-STEP VERTICAL TIMELINE ─────────────────────────
            Each step is a card on the right with a numbered marker
            and connecting purple line on the left rail. The line is
            a single absolutely-positioned div behind all steps —
            cheaper than per-step pseudo-elements, identical visual.
            Markers are blocked from the line via background-color
            painting over it. */}
        <section
          aria-labelledby="steps-heading"
          className="bg-background py-24 sm:py-32"
        >
          <div className="mx-auto w-full max-w-[1240px] px-6 sm:px-8 lg:px-14 xl:px-20">
            <h2
              id="steps-heading"
              className="text-sm font-medium uppercase tracking-[0.18em] text-muted"
            >
              The five steps
            </h2>
            <p
              className="mt-6 max-w-3xl font-medium leading-tight text-foreground"
              style={{
                fontSize: "clamp(32px, 4.4vw, 56px)",
                letterSpacing: "-0.04em",
              }}
            >
              From first call to live system, here&apos;s exactly what
              happens.
            </p>

            <ol
              role="list"
              className={
                /* `relative` so the connecting line below is positioned
                   relative to the list, not the page. Remove default ol
                   numbering since each step renders its own large
                   numeral via the numeral prop. */
                "relative mt-16 space-y-12 sm:space-y-16 list-none p-0"
              }
            >
              {/* Vertical connector line — sits on the left rail of the
                  step cards. `top-8 bottom-8` so it doesn't extend past
                  the first/last numeral marker. Mobile renders the line
                  at the start of the card (left:24px), desktop at left:32px. */}
              <span
                aria-hidden
                className="pointer-events-none absolute left-[23px] sm:left-[31px] top-8 bottom-8 w-px bg-gradient-to-b from-primary/0 via-primary to-primary/0"
              />

              {STEPS.map((step, idx) => (
                <AnimateIn
                  key={step.numeral}
                  y={28}
                  delay={idx * 0.06}
                >
                  <li className="relative pl-16 sm:pl-24">
                    {/* Numeral marker — sits on the connector line.
                        background-color matches `bg-background` so the
                        line passes BEHIND the marker, not through it. */}
                    <span
                      aria-hidden
                      className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-background border-2 border-primary text-primary font-semibold text-lg tracking-tight"
                    >
                      {step.numeral}
                    </span>

                    <MagicCard className="p-6 sm:p-8 lg:p-10">
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 sm:gap-6 border-b border-border pb-4 sm:pb-6">
                        <h3
                          className="font-medium tracking-[-0.03em] text-foreground"
                          style={{ fontSize: "clamp(28px, 3.4vw, 44px)" }}
                        >
                          {step.name}
                        </h3>
                        <span className="text-sm font-medium uppercase tracking-[0.16em] text-primary">
                          {step.duration}
                        </span>
                      </div>

                      <p className="mt-6 text-lg sm:text-xl leading-relaxed text-foreground-mid">
                        {step.body}
                      </p>

                      <div className="mt-8">
                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
                          What you get
                        </p>
                        <ul className="mt-4 space-y-2">
                          {step.deliverables.map((deliverable) => (
                            <li
                              key={deliverable}
                              className="flex items-start gap-3 text-base sm:text-lg text-foreground-mid"
                            >
                              <CheckCircle2
                                className="mt-1 h-5 w-5 shrink-0 text-primary"
                                aria-hidden
                              />
                              <span>{deliverable}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </MagicCard>
                  </li>
                </AnimateIn>
              ))}
            </ol>
          </div>
        </section>

        {/* ─── SPRINT ANATOMY ───────────────────────────────────
            10-day grid showing what happens day-by-day inside a
            standard two-week sprint. Demystifies "we ship in sprints"
            by exposing the actual cadence. Renders as a horizontal
            scroll on mobile and a 5x2 grid on desktop. */}
        <section
          aria-labelledby="anatomy-heading"
          className="bg-surface border-y border-border py-24 sm:py-32"
        >
          <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
            <h2
              id="anatomy-heading"
              className="text-sm font-medium uppercase tracking-[0.18em] text-muted"
            >
              Anatomy of a sprint
            </h2>
            <p
              className="mt-6 max-w-3xl font-medium leading-tight text-foreground"
              style={{
                fontSize: "clamp(32px, 4.4vw, 56px)",
                letterSpacing: "-0.04em",
              }}
            >
              Two weeks. Ten days. Every day accounted for.
            </p>

            <ol
              role="list"
              className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 list-none p-0"
            >
              {SPRINT_ANATOMY.map((day, idx) => (
                <AnimateIn key={day.day} y={16} delay={idx * 0.04}>
                  <li
                    className={
                      /* Each day card is a thin tile. Day labels in
                         brand purple to make the timeline scannable.
                         The 6th day (Mon W2) is visually separated
                         on desktop by the row break — that's the
                         "halfway point" the timeline emphasizes. */
                      "h-full rounded-2xl border border-border bg-background p-5 transition-all hover:border-primary hover:-translate-y-0.5"
                    }
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                      {day.day}
                    </p>
                    <p className="mt-3 text-base leading-relaxed text-foreground-mid">
                      {day.focus}
                    </p>
                  </li>
                </AnimateIn>
              ))}
            </ol>
          </div>
        </section>

        {/* ─── TOOLS STRIP ──────────────────────────────────────
            Compact list of the actual tooling we use. Reads as
            transparency rather than name-dropping. */}
        <section
          aria-labelledby="tools-heading"
          className="bg-background py-20 sm:py-24"
        >
          <div className="mx-auto w-full max-w-[1240px] px-6 sm:px-8 lg:px-14 xl:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-baseline">
              <div className="lg:col-span-4">
                <h2
                  id="tools-heading"
                  className="text-sm font-medium uppercase tracking-[0.18em] text-muted"
                >
                  Tools we use
                </h2>
                <p className="mt-4 text-lg sm:text-xl text-foreground-mid leading-relaxed">
                  We pick boring stacks for the bones and modern tools where
                  they buy speed. No magic, no buzzword bingo.
                </p>
              </div>
              <ul className="lg:col-span-8 flex flex-wrap gap-3">
                {TOOLS.map((tool) => (
                  <li
                    key={tool}
                    className="rounded-full border border-border bg-surface px-5 py-2.5 text-base text-foreground"
                  >
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ─── CLOSING CTA ──────────────────────────────────────
            Echoes the pattern from /work and /about. */}
        <section className="bg-background py-20 sm:py-28">
          <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
            <div className="rounded-[32px] bg-foreground px-8 py-16 sm:px-16 sm:py-24 text-background relative overflow-hidden">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary opacity-40"
                style={{ filter: "blur(140px)" }}
              />
              <div className="relative max-w-3xl">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-background/60">
                  Ready when you are
                </p>
                <h2
                  className="mt-4 font-medium leading-[1.05] text-background"
                  style={{
                    fontSize: "clamp(32px, 5vw, 64px)",
                    letterSpacing: "-0.04em",
                  }}
                >
                  Pick a{" "}
                  <span
                    className="italic"
                    style={{
                      fontFamily:
                        "var(--font-instrument-serif), Georgia, serif",
                    }}
                  >
                    sprint
                  </span>
                  . We&apos;ll do the rest.
                </h2>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link
                    href="/contact"
                    className="pill pill-primary focus-ring inline-flex"
                  >
                    Start a project
                  </Link>
                  <Link
                    href="/work"
                    className="pill border border-background/30 text-background hover:bg-background/10 focus-ring inline-flex"
                  >
                    See past sprints
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
