"use client";

import { AnimateIn } from "@/components/primitives";
import { CASE_STUDIES, INDUSTRIES, type IndustryChip } from "@/app/work/data";

/* Map an industry chip to the accent color of its first listed client.
   The chip then hovers in that case study's color, so the user sees a
   visual thread from "this is a sector we work in" (section 2) to
   "here's the actual project" (sections 3 and 4). When the chip has
   no matching study (data drift), falls back to brand primary so the
   page never renders a missing-color black border. */
function getChipAccent(chip: IndustryChip): string {
  const firstClient = chip.clients[0];
  if (!firstClient) return "var(--color-primary)";
  const match = CASE_STUDIES.find((cs) =>
    cs.client.toLowerCase().startsWith(firstClient.toLowerCase()),
  );
  return match?.accentColor ?? "var(--color-primary)";
}

/**
 * WorkIndustryStrip — connector between the dark hero and the marquee
 * featured tile. Pure typography, no icons, no links.
 *
 * Each industry is rendered as a typographic chip with the count
 * superscripted in mono brand purple. The chips stagger in via
 * AnimateIn (IntersectionObserver-driven CSS) so the strip "lands"
 * when it enters viewport without any per-frame JS cost.
 *
 * The whole strip is editorial-grade: hairline top + bottom border,
 * generous gutters, mono micro-copy eyebrow. Same surface treatment
 * as the /about page's stat-as-hero card row — keeps the magazine
 * rhythm continuous.
 */
export default function WorkIndustryStrip() {
  return (
    <section
      aria-labelledby="industry-strip-heading"
      className="bg-background border-y border-border"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20 py-14 sm:py-20 lg:py-24">
        {/* The hero phase-2 text ("Nine industries. One Team.") IS this
            section's heading. We carry only an sr-only label here so
            assistive tech still announces the section landmark, and
            jump straight to the chip row + structured client list. */}
        <h2 id="industry-strip-heading" className="sr-only">
          Nine industries served by TGlobal.
        </h2>

        <ul className="flex flex-wrap justify-center gap-x-3 gap-y-3 sm:gap-x-4 sm:gap-y-4 items-center">
            {INDUSTRIES.map((chip, idx) => {
              const chipAccent = getChipAccent(chip);
              return (
                <AnimateIn
                  key={chip.label}
                  as="li"
                  delay={0.04 * idx}
                  y={8}
                  duration={0.5}
                  className="inline-flex"
                >
                  <span
                    className="group inline-flex items-baseline gap-1 rounded-full border border-border bg-surface px-4 py-2 sm:px-5 sm:py-2.5 text-base sm:text-lg font-medium tracking-[-0.02em] text-foreground transition-colors duration-300 hover:bg-[color-mix(in_srgb,var(--chip-accent)_10%,transparent)] hover:border-[color-mix(in_srgb,var(--chip-accent)_45%,transparent)]"
                    style={{
                      /* Per-industry accent — looked up from the first
                         client's case study. The hover state now lights
                         the chip in the same color the case study card
                         uses, threading the page together visually. */
                      ["--chip-accent" as never]: chipAccent,
                    }}
                    title={chip.clients.join(" · ")}
                  >
                    {chip.label}
                    {chip.count > 1 ? (
                      <sup
                        className="font-mono text-[0.65em] font-semibold translate-y-[-2px] transition-colors duration-300"
                        style={{
                          fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                          color: "var(--chip-accent)",
                        }}
                        aria-label={`${chip.count} projects`}
                      >
                        ×{chip.count}
                      </sup>
                    ) : null}
                  </span>
                </AnimateIn>
              );
            })}
          </ul>

        {/* Sub-caption listing the actual project names — sells the
            breadth in plain language, scannable for the boss when he
            audits the page. Sits below the chip row with a hairline
            separator so it reads as supporting detail, not a second
            heading. */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-border/60">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
            {INDUSTRIES.map((chip) => (
              <div
                key={chip.label}
                className="flex items-baseline justify-between gap-6 text-sm sm:text-base"
              >
                <dt className="font-medium text-foreground tracking-[-0.01em]">
                  {chip.label}
                </dt>
                <dd className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.14em] text-muted text-right">
                  {chip.clients.join(" · ")}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
