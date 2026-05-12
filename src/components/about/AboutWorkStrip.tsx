import Link from "next/link";

import { ArrowUpRight } from "lucide-react";

import { AnimateIn, MaskReveal } from "@/components/primitives";

/* Work strip — editorial case-study row.
   ─────────────────────────────────────────────────────────────
   Sits between the founder letter and the operating model so the
   page transitions from the philosophical "why" to the tangible
   "what shipped."

   Each tile is a hairline-bordered editorial card. Hover state:
   accent rule grows from 12 → 96px (premium grow-into-place
   gesture) and chevron migrates up-right. */

interface CaseStudy {
  readonly slug: string;
  readonly index: string;
  readonly client: string;
  readonly headline: string;
  readonly outcome: string;
  readonly accent: string;
}

const CASES: readonly CaseStudy[] = [
  {
    slug: "skyline",
    index: "S/01",
    client: "Skyline",
    headline: "Booking flow rebuilt in two sprints.",
    outcome: "+38% conversion, zero downtime cutover.",
    accent: "#4b28ff",
  },
  {
    slug: "medcollect",
    index: "M/02",
    client: "MedCollect",
    headline: "Clinical intake from 14 mins to 4.",
    outcome: "Audit-ready logs, 0 PHI leaks at launch.",
    accent: "#fc5038",
  },
  {
    slug: "jijibai",
    index: "J/03",
    client: "Jijibai",
    headline: "Marketplace shipped before the launch press.",
    outcome: "Built, reviewed, deployed in 19 days.",
    accent: "#00a656",
  },
];

export default function AboutWorkStrip() {
  return (
    <section
      aria-labelledby="work-strip-heading"
      className="relative py-24 sm:py-32 lg:py-40"
      style={{ background: "var(--color-paper-alt)" }}
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <p className="editorial-label text-foreground-mid">
              <span className="tabular-nums">№ 02</span>
              <span aria-hidden className="h-px w-8 bg-foreground-mid/40" />
              <span>Work in production</span>
            </p>
            <MaskReveal
              text="Three sprints, three live products."
              as="h2"
              id="work-strip-heading"
              className="mt-8 max-w-[20ch] text-balance font-medium leading-[1] text-foreground"
              style={{
                fontSize: "clamp(36px, 4.8vw, 76px)",
                letterSpacing: "-0.045em",
              }}
            />
          </div>
          <Link
            href="/work"
            // Pill cursor label — matches the opt-in pattern used by
            // MagneticPill (cursorText) and the CTA section's view-work
            // link. Without this the cursor falls through to the empty
            // ring state on hover.
            data-cursor-text="all work"
            className="inline-flex items-center gap-2 self-start text-base font-medium text-foreground hover:text-primary lg:col-span-5 lg:justify-end lg:text-lg"
            style={{ letterSpacing: "-0.02em" }}
          >
            See all case studies
            <ArrowUpRight aria-hidden size={18} />
          </Link>
        </div>

        <ol className="mt-16 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
          {CASES.map((c, i) => (
            <AnimateIn key={c.slug} y={20} delay={i * 0.06}>
              <li>
                <Link
                  href={`/work/${c.slug}`}
                  // Pill cursor label so the cursor reads as "this is
                  // a thing you can open" not a generic ring. Matches
                  // the CTA section's secondary "see it" link cadence.
                  data-cursor-text="view it"
                  /* Card polish:
                     • Internal padding (was 0 → px-5 py-7 → px-7 py-8
                       at lg) so content has breathing room on hover.
                     • Hover state: white bg + slight upward translate
                       + lavender-tinted shadow. Reads as "lifted
                       page", not a stark panel swap. The shadow uses
                       the brand primary tint at low opacity to keep
                       the elevation feeling on-brand rather than
                       generic neutral grey.
                     • Duration 500ms with ease-out for a settled,
                       premium gesture (the previous 300ms felt
                       snappy/cheap once the lift was added). */
                  className="group relative block h-full overflow-hidden border-t border-foreground/15 px-5 py-7 transition-[transform,box-shadow,background-color] duration-500 ease-out hover:-translate-y-1 hover:bg-white hover:shadow-[0_28px_64px_-30px_rgba(75,40,255,0.25)] sm:px-6 sm:py-8 lg:px-7"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span
                      className="text-foreground/60"
                      style={{
                        fontFamily: "var(--font-mono), monospace",
                        fontSize: "11px",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                      }}
                    >
                      {c.index}
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      size={20}
                      className="text-foreground/55 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-foreground"
                    />
                  </div>
                  <MaskReveal
                    text={c.client}
                    as="p"
                    className="mt-4 font-medium leading-[1] text-foreground"
                    style={{
                      fontSize: "clamp(28px, 2.6vw, 40px)",
                      letterSpacing: "-0.04em",
                    }}
                    stagger={0.05}
                    duration={0.7}
                  />
                  <p
                    className="mt-6 max-w-[34ch] text-pretty text-foreground-mid"
                    style={{
                      fontSize: "clamp(17px, 1.25vw, 20px)",
                      lineHeight: 1.45,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {c.headline}
                  </p>
                  <p
                    className="mt-6 italic text-foreground/70"
                    style={{
                      fontFamily: "var(--font-instrument-serif), Georgia, serif",
                      fontSize: "clamp(15px, 1.1vw, 18px)",
                    }}
                  >
                    {c.outcome}
                  </p>
                  <span
                    aria-hidden
                    className="mt-8 block h-px w-12 transition-[width] duration-500 group-hover:w-24"
                    style={{ background: c.accent }}
                  />
                </Link>
              </li>
            </AnimateIn>
          ))}
        </ol>
      </div>
    </section>
  );
}
