import { AnimateIn } from "@/components/primitives";

/* ProcessContrast — agency vs TGlobal comparison strip.
   ─────────────────────────────────────────────────────────────
   Two-column editorial table. Six rows that escalate from soft
   difference (process speed) to hard difference (operational
   independence). Reader gets the differentiation in 8 seconds. */

interface ContrastRow {
  readonly label: string;
  readonly agency: string;
  readonly tglobal: string;
}

const ROWS: readonly ContrastRow[] = [
  {
    label: "Discovery",
    agency: "Six-week discovery → 40-slide deck → kickoff meeting",
    tglobal: "Tuesday intake. Wednesday code starts. Friday demo.",
  },
  {
    label: "Cadence",
    agency: "Quarterly releases. If on schedule. If nothing breaks.",
    tglobal: "Two weeks. Vertical slice. Production Friday.",
  },
  {
    label: "Artifact",
    agency: "60-slide design deck before a line of code",
    tglobal: "Wireframe. Code. Shipped. All in two weeks.",
  },
  {
    label: "Pricing",
    agency: "Time and materials. $250/hour. Retainers. Scope? Negotiable.",
    tglobal: "Fixed sprint cost. Fixed deadline. Fixed scope. Done.",
  },
  {
    label: "Ownership",
    agency: "We own the code. You get a license.",
    tglobal: "Own your code. Own your deployment. Own your future.",
  },
  {
    label: "On-call",
    agency: "Support ends at deployment. Post-launch is your problem.",
    tglobal: "Friday deploy. Sunday on-call. Two weeks of guardrails.",
  },
];

export default function ProcessContrast() {
  return (
    <section
      id="process-contrast"
      aria-labelledby="process-contrast-heading"
      className="relative w-full bg-background py-24 sm:py-32"
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
          <span className="tabular-nums">№ 02</span>
          <span aria-hidden className="h-px w-8 bg-foreground-mid/40" />
          <span>Two weeks. Vertical slice. Live.</span>
        </p>

        {/* Headline */}
        <h2
          id="process-contrast-heading"
          className="mt-6 max-w-4xl font-medium leading-tight text-foreground"
          style={{
            fontSize: "clamp(32px, 5.4vw, 72px)",
            letterSpacing: "-0.045em",
          }}
        >
          We don&apos;t bill by the hour. We ship by{" "}
          <span
            className="italic text-[#6b5ce7]"
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
            }}
          >
            Friday
          </span>
          .
        </h2>

        {/* Six-row comparison table */}
        <div className="mt-14 sm:mt-16">
          {/* Column header strip — only renders on lg+. On mobile, each
              row uses its own inline label. */}
          <div className="hidden lg:grid lg:grid-cols-[160px_1fr_1fr] lg:gap-x-10 lg:border-b lg:border-border lg:pb-4">
            <span
              className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted"
              style={{
                fontFamily:
                  "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              Category
            </span>
            <span
              className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted"
              style={{
                fontFamily:
                  "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              Typical agency
            </span>
            <span
              className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary"
              style={{
                fontFamily:
                  "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              TGlobal
            </span>
          </div>

          <ul role="list" className="list-none p-0">
            {ROWS.map((row, idx) => (
              <AnimateIn
                as="li"
                key={row.label}
                y={24}
                delay={idx * 0.06}
                className="grid grid-cols-1 gap-y-3 border-b border-border py-6 sm:py-8 lg:grid-cols-[160px_1fr_1fr] lg:gap-x-10 lg:gap-y-0"
              >
                <span
                  className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground"
                  style={{
                    fontFamily:
                      "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
                  }}
                >
                  {row.label}
                </span>

                {/* Agency — mobile shows label inline */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted lg:hidden">
                    Typical agency
                  </span>
                  <p className="text-base leading-relaxed text-foreground-mid line-through decoration-foreground-mid/60 decoration-1 sm:text-lg">
                    {row.agency}
                  </p>
                </div>

                {/* TGlobal */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary lg:hidden">
                    TGlobal
                  </span>
                  <p className="text-base font-medium leading-relaxed text-foreground sm:text-lg">
                    {row.tglobal}
                  </p>
                </div>
              </AnimateIn>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
