import { AnimateIn } from "@/components/primitives";

/* ProcessQA — risk + exit terms in three editorial pairs.
   ─────────────────────────────────────────────────────────────
   Soft → cost → trust anxiety escalation. Each answer ends on a
   concrete commitment (sprint cadence, named price posture, named
   runbook artifact). No questions in body copy; the questions are
   the headers. */

interface Pair {
  readonly question: string;
  readonly answer: string;
}

const PAIRS: readonly Pair[] = [
  {
    question: "What if we ship two months late?",
    answer:
      "Sprints are boxing matches with a fixed bell. We ship on Friday. Changes don't move the ship date — they move to next sprint.",
  },
  {
    question: "Are there hidden fees after Sprint 1?",
    answer:
      "Contact us for pricing. One fixed number per sprint. Two weeks. That's it. No meetings charge, no revision fees, no admin tax. You own the code and can walk after Sprint 1 with zero penalty.",
  },
  {
    question: "Who owns the code we pay for?",
    answer:
      "You own the code. Full access to git. We hand you a runbook — deployment, monitoring, everything. You can run this without us Monday morning.",
  },
];

export default function ProcessQA() {
  return (
    <section
      id="process-qa"
      aria-labelledby="process-qa-heading"
      className="relative w-full border-y border-border bg-background py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-[1240px] px-6 sm:px-8 lg:px-14 xl:px-20">
        {/* Eyebrow */}
        <p
          className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.22em] text-foreground-mid"
          style={{
            fontFamily:
              "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          <span className="tabular-nums">№ 07</span>
          <span aria-hidden className="h-px w-8 bg-foreground-mid/40" />
          <span>No surprises, no trap doors</span>
        </p>

        {/* Headline — three "Fixed" words in italic serif. */}
        <h2
          id="process-qa-heading"
          className="mt-6 max-w-4xl font-medium leading-tight text-foreground"
          style={{
            fontSize: "clamp(32px, 5.4vw, 72px)",
            letterSpacing: "-0.045em",
          }}
        >
          <span
            className="italic text-[#6b5ce7]"
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
            }}
          >
            Fixed
          </span>{" "}
          scope.{" "}
          <span
            className="italic text-[#6b5ce7]"
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
            }}
          >
            Fixed
          </span>{" "}
          cost.{" "}
          <span
            className="italic text-[#6b5ce7]"
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
            }}
          >
            Fixed
          </span>{" "}
          ship.
        </h2>

        {/* Q&A pairs — rendered as semantic articles rather than a
            dl. The previous dl/dt/dd structure required a wrapper
            div for grid layout, which axe-core flagged as breaking
            the dl parentage (definition-list + dlitem rules).
            Editorial Q&A is not a true term-definition pattern;
            article + h3 + p reads cleanly for AT and removes the
            structural violation. */}
        <div className="mt-16 space-y-12 sm:space-y-16">
          {PAIRS.map((pair, idx) => (
            <AnimateIn key={pair.question} y={24} delay={idx * 0.08}>
              <article className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-14">
                <header className="lg:col-span-5">
                  <div className="flex items-baseline gap-4">
                    <span
                      className="shrink-0 text-sm font-semibold uppercase tracking-[0.18em] text-primary"
                      style={{
                        fontFamily:
                          "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
                      }}
                    >
                      Q.0{idx + 1}
                    </span>
                    <span
                      aria-hidden
                      className="h-px flex-1 translate-y-[-4px] bg-border"
                    />
                  </div>
                  <h3
                    className="mt-4 font-medium tracking-[-0.03em] text-foreground"
                    style={{ fontSize: "clamp(22px, 2.6vw, 34px)" }}
                  >
                    {pair.question}
                  </h3>
                </header>
                <p className="text-lg leading-relaxed text-foreground-mid sm:text-xl lg:col-span-7">
                  {pair.answer}
                </p>
              </article>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
