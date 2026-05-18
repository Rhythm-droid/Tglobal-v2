"use client";

import { AnimateIn, MagicCard } from "@/components/primitives";
import { TESTIMONIALS } from "@/app/work/data";

/**
 * WorkTestimonials — three pull-quotes from the engagements above.
 *
 * Sits between WorkMetrics (numbers) and WorkClients (logos) as the
 * "voices" layer of social proof. Metrics tell you what moved; voices
 * tell you what it felt like. The combination converts hedged readers
 * who don't trust raw numbers alone.
 *
 * Visual treatment:
 *   • White background — continuity with metrics + clients sections.
 *   • Editorial layout: oversized opening quote mark (italic Instrument
 *     Serif), then the quote in sans, then attribution in mono.
 *   • Three cards, each tagged with a project + an accent color that
 *     ties back to that project's grid card.
 *   • MagicCard wrapper for the cursor-tracking gradient that everyone
 *     else on the page uses — keeps the interaction language coherent.
 *   • No avatars, no logos — pure typography. The point is the words,
 *     not stock photos of fake stakeholders.
 */
export default function WorkTestimonials() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="bg-background border-t border-border"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20 py-20 sm:py-24 lg:py-28">
        <div className="flex items-baseline justify-between gap-6 mb-12 sm:mb-16">
          <p
            id="testimonials-heading"
            className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.22em] text-muted"
            style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
          >
            N° 07 — Voices
          </p>
          <p
            className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-muted tabular-nums hidden sm:block"
            style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
          >
            03 quotes · 03 engagements
          </p>
        </div>

        <h2
          className="font-medium text-foreground leading-[1.02] max-w-4xl"
          style={{
            fontSize: "clamp(38px, 5.4vw, 76px)",
            letterSpacing: "-0.05em",
          }}
        >
          What the teams{" "}
          <span
            className="italic text-primary"
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontWeight: 400,
            }}
          >
            actually said.
          </span>
        </h2>

        <div className="mt-14 sm:mt-20 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
          {TESTIMONIALS.map((t, idx) => (
            <AnimateIn
              key={t.quote.slice(0, 32)}
              delay={idx * 0.1}
              y={20}
              duration={0.6}
            >
              <MagicCard
                as="article"
                glowColor={`${t.accentColor}26`}
                radius={400}
                className="relative h-full rounded-[24px] bg-surface-alt border border-border/60 p-6 sm:p-7 lg:p-8 flex flex-col gap-6"
              >
                {/* Oversized opening quote — italic Instrument Serif,
                    sits as a graphic mark above the quote text. Picks
                    up the per-quote accent so each card has visual
                    identity tied to its source project. */}
                <span
                  aria-hidden
                  className="block leading-[0.7] select-none"
                  style={{
                    fontFamily: "var(--font-instrument-serif), Georgia, serif",
                    fontWeight: 400,
                    fontStyle: "italic",
                    fontSize: "clamp(72px, 8vw, 112px)",
                    color: t.accentColor,
                    opacity: 0.85,
                  }}
                >
                  &ldquo;
                </span>

                {/* The quote itself — sans, foreground ink, snug
                    leading so it reads as a single thought. */}
                <p
                  className="text-lg sm:text-xl lg:text-2xl text-foreground leading-snug"
                  style={{ letterSpacing: "-0.018em" }}
                >
                  {t.quote}
                </p>

                {/* Attribution footer — mono micro-copy, accent dot for
                    visual rhythm. Project line carries the connection
                    back to the case studies above. */}
                <div className="mt-auto pt-5 border-t border-border/60 flex flex-col gap-1">
                  <p
                    className="text-sm font-medium text-foreground tracking-[-0.01em]"
                  >
                    {t.author}
                    <span className="text-muted font-normal"> · {t.role}</span>
                  </p>
                  <p
                    className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-muted inline-flex items-center gap-2"
                    style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
                  >
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background: t.accentColor,
                        boxShadow: `0 0 6px ${t.accentColor}`,
                      }}
                    />
                    {t.project}
                  </p>
                </div>
              </MagicCard>
            </AnimateIn>
          ))}
        </div>

        {/* Honesty footnote — quiet editorial signal that we don't
            invent quotes. Real but anonymized for client confidentiality. */}
        <p
          className="mt-10 sm:mt-12 font-mono text-[11px] sm:text-xs uppercase tracking-[0.18em] text-muted"
          style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
        >
          Names abridged for client confidentiality · originals available on request
        </p>
      </div>
    </section>
  );
}
