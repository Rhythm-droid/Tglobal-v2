import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  AnimateIn,
  MagicCard,
  NumberTicker,
  ScrollProgress,
  WordReveal,
} from "@/components/primitives";
import { cn } from "@/lib/cn";
import {
  CASE_STUDIES,
  getCaseStudyBySlug,
  getNextCaseStudy,
} from "../data";

/**
 * /work/[slug] — Case study detail template.
 *
 * One template renders all four case studies (Skyline, Medcollect,
 * JIJIBAI, Turpai) with content driven from work/data.ts. To add a
 * fifth case study, append to the CASE_STUDIES array in data.ts —
 * Next will pick it up via generateStaticParams below.
 *
 * Section flow:
 *   1. ScrollProgress bar (top of viewport, fills as you scroll).
 *   2. Hero — client name + outcome, full-bleed gradient or cover.
 *   3. At-a-glance metric bar — duration, industry, sprint count.
 *   4. The challenge — long-form WordReveal.
 *   5. Our approach — 3-column staggered grid.
 *   6. Stack used — pill list of tech.
 *   7. Results — big NumberTicker stats.
 *   8. Testimonial — quote card (if testimonial exists in data).
 *   9. Next case → card linking to next slug (cycles back to first).
 *  10. CTA strip — "Start a project" → /contact.
 *
 * Next.js 16 details:
 *   • `generateStaticParams` returns the slug list at build time, so
 *     all case study pages prerender to static HTML/CSS — fast loads,
 *     fully indexable.
 *   • `params` in generateMetadata + page is a Promise<{slug}> in
 *     Next 16 (was a plain object in 14/15). The `await` is required.
 *   • `notFound()` returns the closest not-found.tsx; if the slug
 *     isn't in our data array, the user gets a clean 404 instead of
 *     a runtime crash.
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

/* Tells Next which slugs to prerender. Returns the array for build-
   time static generation. */
export async function generateStaticParams() {
  return CASE_STUDIES.map((cs) => ({ slug: cs.slug }));
}

/* Per-slug metadata — title, description, canonical, og — so each
   case study has its own social preview rather than the site default. */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) {
    /* Returning empty metadata is fine — the page will then call
       notFound() and render the 404 page. */
    return { title: "Case study not found" };
  }
  const url = `https://tglobal.in/work/${study.slug}`;
  return {
    title: `${study.client}`,
    description: study.outcome,
    alternates: { canonical: url },
    openGraph: {
      title: `${study.client} · TGlobal case study`,
      description: study.outcome,
      url,
    },
  };
}

export default async function CaseStudyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);

  /* Slug not in our data? Return 404. Better than rendering a
     half-empty page or crashing on undefined property access. */
  if (!study) notFound();

  const next = getNextCaseStudy(study.slug);
  const accent = study.accentColor ?? "#4B28FF";

  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main className="flex-1">
        {/* ─── HERO ─────────────────────────────────────────────
            Full-bleed gradient with the client's accent color. When a
            cover image is later added to data.ts, swap the gradient
            for an Image component (next/image) here. */}
        <section
          aria-label={`${study.client} case study hero`}
          className="relative overflow-hidden text-white pt-32 sm:pt-40 lg:pt-48 pb-20 sm:pb-28"
          style={{
            background: `linear-gradient(135deg, ${accent} 0%, #0A0A14 100%)`,
          }}
        >
          {/* Decorative blob — adds depth on the gradient hero */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -right-40 h-[480px] w-[480px] rounded-full opacity-50"
            style={{
              background: accent,
              filter: "blur(180px)",
            }}
          />
          <div className="relative mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
            <Link
              href="/work"
              className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-white/70 hover:text-white transition-colors focus-ring"
            >
              <span aria-hidden>←</span> All work
            </Link>
            <div className="mt-8 flex flex-col gap-3">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/70">
                {study.industry}
              </p>
              <h1
                className="font-medium leading-[0.98] text-white"
                style={{
                  fontSize: "clamp(56px, 8.4vw, 144px)",
                  letterSpacing: "-0.05em",
                }}
              >
                {study.client}
              </h1>
            </div>
            <div className="mt-8 max-w-3xl">
              <WordReveal
                text={study.outcome}
                as="p"
                className="text-xl sm:text-2xl lg:text-3xl font-normal leading-tight text-white/90"
                stagger={0.025}
              />
            </div>
          </div>
        </section>

        {/* ─── AT-A-GLANCE METRIC BAR ───────────────────────────
            Strip of 3 metrics: duration, sprint count, stack count.
            Sits flush under the hero like a credits bar in a film. */}
        <section
          aria-label="At a glance"
          className="bg-foreground text-background border-y border-background/10"
        >
          <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20 py-10 sm:py-14">
            <dl className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.16em] text-background/60">
                  Duration
                </dt>
                <dd className="mt-2 text-2xl sm:text-3xl font-medium tracking-[-0.03em]">
                  {study.duration}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.16em] text-background/60">
                  Industry
                </dt>
                <dd className="mt-2 text-2xl sm:text-3xl font-medium tracking-[-0.03em]">
                  {study.industry}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.16em] text-background/60">
                  Stack
                </dt>
                <dd className="mt-2 text-2xl sm:text-3xl font-medium tracking-[-0.03em]">
                  <NumberTicker value={study.stack.length} suffix="+" />
                  <span className="ml-2 text-base text-background/60 align-middle">
                    technologies
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.16em] text-background/60">
                  Outcomes
                </dt>
                <dd className="mt-2 text-2xl sm:text-3xl font-medium tracking-[-0.03em]">
                  <NumberTicker value={study.results.length} />
                  <span className="ml-2 text-base text-background/60 align-middle">
                    measured
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ─── CHALLENGE ────────────────────────────────────────
            The "what was broken" section. Reads as editorial prose
            with WordReveal pacing. */}
        <section
          aria-labelledby="challenge-heading"
          className="bg-background py-24 sm:py-32"
        >
          <div className="mx-auto w-full max-w-[1240px] px-6 sm:px-8 lg:px-14 xl:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              <div className="lg:col-span-4">
                <h2
                  id="challenge-heading"
                  className="text-sm font-medium uppercase tracking-[0.18em] text-muted"
                >
                  The challenge
                </h2>
                <p
                  className="mt-6 italic font-medium text-foreground leading-tight"
                  style={{
                    fontFamily:
                      "var(--font-instrument-serif), Georgia, serif",
                    fontSize: "clamp(28px, 3.4vw, 44px)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  Where they were stuck.
                </p>
              </div>
              <div className="lg:col-span-8">
                <WordReveal
                  text={study.challenge}
                  as="p"
                  className="text-lg sm:text-xl lg:text-2xl font-normal leading-relaxed text-foreground"
                  stagger={0.02}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ─── OUR APPROACH ─────────────────────────────────────
            3-column staggered grid. Each column = one move we made,
            numbered 01/02/03. */}
        <section
          aria-labelledby="approach-heading"
          className="bg-surface border-y border-border py-24 sm:py-32"
        >
          <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
            <h2
              id="approach-heading"
              className="text-sm font-medium uppercase tracking-[0.18em] text-muted"
            >
              Our approach
            </h2>
            <p
              className="mt-6 max-w-3xl font-medium leading-tight text-foreground"
              style={{
                fontSize: "clamp(32px, 4.4vw, 56px)",
                letterSpacing: "-0.04em",
              }}
            >
              Three moves that unblocked the rest.
            </p>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {study.approach.map((move, idx) => (
                <AnimateIn key={idx} y={20} delay={idx * 0.08}>
                  <MagicCard className="h-full p-6 sm:p-8">
                    <span
                      aria-hidden
                      className="block italic text-primary"
                      style={{
                        fontFamily:
                          "var(--font-instrument-serif), Georgia, serif",
                        fontSize: "clamp(48px, 5vw, 72px)",
                        lineHeight: 1,
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-6 text-lg sm:text-xl leading-relaxed text-foreground">
                      {move}
                    </p>
                  </MagicCard>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>

        {/* ─── STACK PILLS ──────────────────────────────────────
            Compact pill row of the technologies used. Mirror of the
            tools strip on /process so visitors who came from there
            recognize the visual language. */}
        <section
          aria-labelledby="stack-heading"
          className="bg-background py-20 sm:py-24"
        >
          <div className="mx-auto w-full max-w-[1240px] px-6 sm:px-8 lg:px-14 xl:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-baseline">
              <div className="lg:col-span-4">
                <h2
                  id="stack-heading"
                  className="text-sm font-medium uppercase tracking-[0.18em] text-muted"
                >
                  Stack
                </h2>
                <p className="mt-4 text-lg sm:text-xl text-foreground-mid leading-relaxed">
                  Tools we picked for this engagement.
                </p>
              </div>
              <ul className="lg:col-span-8 flex flex-wrap gap-3">
                {study.stack.map((tool) => (
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

        {/* ─── RESULTS — big numbers ────────────────────────────
            The payoff section. NumberTicker counts each metric as it
            scrolls into view, so the numbers feel earned. */}
        <section
          aria-labelledby="results-heading"
          className="bg-foreground text-background py-24 sm:py-32"
        >
          <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
            <h2
              id="results-heading"
              className="text-sm font-medium uppercase tracking-[0.18em] text-background/60"
            >
              Results
            </h2>
            <p
              className="mt-6 max-w-3xl font-medium leading-tight text-background"
              style={{
                fontSize: "clamp(32px, 4.4vw, 56px)",
                letterSpacing: "-0.04em",
              }}
            >
              What we shipped, in numbers.
            </p>

            <dl
              className={cn(
                "mt-14 grid gap-10 sm:gap-12",
                /* Auto-fit by count: 2 cols if 2 results, 3 if 3, 4 if 4. */
                study.results.length === 4
                  ? "grid-cols-2 lg:grid-cols-4"
                  : study.results.length === 3
                    ? "grid-cols-1 sm:grid-cols-3"
                    : "grid-cols-1 sm:grid-cols-2",
              )}
            >
              {study.results.map((metric) => (
                <div key={metric.label}>
                  <dt
                    className="font-medium leading-[0.9] text-background"
                    style={{
                      fontSize: "clamp(48px, 7vw, 96px)",
                      letterSpacing: "-0.05em",
                    }}
                  >
                    {/* The metric value is a string like "60%" or "$200K"
                        — keep it raw rather than parsing. NumberTicker
                        handles plain numbers; for non-numeric values
                        we render the string directly. */}
                    {metric.value}
                  </dt>
                  <dd className="mt-3 text-base sm:text-lg text-background/70 leading-snug">
                    {metric.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ─── TESTIMONIAL (optional) ───────────────────────────
            Renders only when the case study has a testimonial in data. */}
        {study.testimonial ? (
          <section
            aria-labelledby="testimonial-heading"
            className="bg-background py-24 sm:py-32"
          >
            <div className="mx-auto w-full max-w-[1240px] px-6 sm:px-8 lg:px-14 xl:px-20">
              <h2 id="testimonial-heading" className="sr-only">
                Client testimonial
              </h2>
              <figure className="mx-auto max-w-3xl text-center">
                <span
                  aria-hidden
                  className="block italic text-primary"
                  style={{
                    fontFamily:
                      "var(--font-instrument-serif), Georgia, serif",
                    fontSize: "clamp(80px, 10vw, 144px)",
                    lineHeight: 0.5,
                  }}
                >
                  &ldquo;
                </span>
                <blockquote
                  className="mt-4 font-medium leading-tight text-foreground"
                  style={{
                    fontSize: "clamp(28px, 3.4vw, 48px)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {study.testimonial.quote}
                </blockquote>
                <figcaption className="mt-8 text-base sm:text-lg text-muted">
                  <span className="font-semibold text-foreground">
                    {study.testimonial.author}
                  </span>
                  <span aria-hidden> · </span>
                  <span>{study.testimonial.role}</span>
                </figcaption>
              </figure>
            </div>
          </section>
        ) : null}

        {/* ─── NEXT CASE STUDY ──────────────────────────────────
            Pushes the visitor to the next case study. Cycles to the
            first one if we're on the last — no dead end. */}
        <section className="bg-surface border-t border-border py-20 sm:py-24">
          <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
              Up next
            </p>
            <Link
              href={`/work/${next.slug}`}
              className="group mt-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 focus-ring rounded-2xl"
              aria-label={`Read the ${next.client} case study`}
            >
              <div>
                <h2
                  className="font-medium leading-[0.98] text-foreground transition-colors group-hover:text-primary"
                  style={{
                    fontSize: "clamp(40px, 6vw, 88px)",
                    letterSpacing: "-0.05em",
                  }}
                >
                  {next.client}
                </h2>
                <p className="mt-3 text-base sm:text-lg text-foreground-mid max-w-2xl">
                  {next.outcome}
                </p>
              </div>
              <span
                aria-hidden
                className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-all group-hover:bg-primary group-hover:translate-x-1"
              >
                <ArrowRight className="h-6 w-6" />
              </span>
            </Link>
          </div>
        </section>

        {/* ─── CLOSING CTA ──────────────────────────────────────
            Same template as /work, /about, /process. */}
        <section className="bg-background py-20 sm:py-28">
          <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
            <div className="rounded-[32px] bg-foreground px-8 py-16 sm:px-16 sm:py-24 text-background relative overflow-hidden">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-40"
                style={{ background: accent, filter: "blur(140px)" }}
              />
              <div className="relative max-w-3xl">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-background/60">
                  Have a similar problem?
                </p>
                <h2
                  className="mt-4 font-medium leading-[1.05] text-background"
                  style={{
                    fontSize: "clamp(32px, 5vw, 64px)",
                    letterSpacing: "-0.04em",
                  }}
                >
                  Let&apos;s build your{" "}
                  <span
                    className="italic"
                    style={{
                      fontFamily:
                        "var(--font-instrument-serif), Georgia, serif",
                    }}
                  >
                    case study
                  </span>{" "}
                  next.
                </h2>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link
                    href="/contact"
                    className="pill pill-primary focus-ring inline-flex"
                  >
                    Start a project <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/work"
                    className="pill border border-background/30 text-background hover:bg-background/10 focus-ring inline-flex"
                  >
                    See all work
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
