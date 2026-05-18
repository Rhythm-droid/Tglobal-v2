import { CheckCircle2 } from "lucide-react";

import { AnimateIn, MagicCard } from "@/components/primitives";

/* ProcessSteps — five-step engagement timeline.
   ─────────────────────────────────────────────────────────────
   Five stages from first call to live system, each a MagicCard
   on the right of a vertical purple connector line. Mirrors the
   /about page's editorial card pattern but anchored to a numbered
   timeline so the reader feels temporal progression. */

interface Step {
  readonly numeral: string;
  readonly name: string;
  readonly duration: string;
  readonly body: string;
  readonly deliverables: readonly string[];
}

const STEPS: readonly Step[] = [
  {
    numeral: "01",
    name: "Scope It",
    duration: "1 week",
    body: "We write a one-page statement of work. You name the risks. We price it fixed. No surprises, no scope creep — just a contract you'll actually read.",
    deliverables: ["Signed SOW", "Fixed cost", "Risk log"],
  },
  {
    numeral: "02",
    name: "Wire It Up",
    duration: "Days 1–3",
    body: "We set up your cloud, your CI/CD pipeline, and your observability dashboard. By Friday, code deployments are automated and you can see every metric that matters.",
    deliverables: ["Cloud setup", "CI/CD pipeline", "Metrics dashboard"],
  },
  {
    numeral: "03",
    name: "Ship in Cycles",
    duration: "Two-week sprints",
    body: "Every two weeks, you ship a vertical slice: a feature that's done, tested, live. We do async standups, demos every Friday, and feature flags for safe rollout.",
    deliverables: ["Vertical slice", "Friday demo", "Feature flag"],
  },
  {
    numeral: "04",
    name: "Go Live",
    duration: "End of sprint",
    body: "Feature flags let you ship code Friday and keep it off until you're ready. Migrations run without downtime. On-call coverage means someone's always watching.",
    deliverables: ["Flagged deploy", "Zero-downtime migration", "On-call schedule"],
  },
  {
    numeral: "05",
    name: "Own It",
    duration: "When you're ready",
    body: "We hand you a runbook: everything your team needs to run the system. Want to keep us? Same sprint cost. Want to go solo? Forty-eight hours to re-scope.",
    deliverables: ["Runbook", "Handoff meeting", "Re-scope call"],
  },
];

export default function ProcessSteps() {
  return (
    <section
      id="process-steps"
      aria-labelledby="process-steps-heading"
      className="relative w-full bg-surface py-24 sm:py-32 lavender-wash"
    >
      <div className="relative mx-auto w-full max-w-[1240px] px-6 sm:px-8 lg:px-14 xl:px-20">
        {/* Eyebrow */}
        <p
          className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.22em] text-foreground-mid"
          style={{
            fontFamily:
              "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          <span className="tabular-nums">№ 03</span>
          <span aria-hidden className="h-px w-8 bg-foreground-mid/40" />
          <span>Here&apos;s what happens</span>
        </p>

        {/* Headline */}
        <h2
          id="process-steps-heading"
          className="mt-6 max-w-4xl font-medium leading-tight text-foreground"
          style={{
            fontSize: "clamp(32px, 5.4vw, 72px)",
            letterSpacing: "-0.045em",
          }}
        >
          We build in{" "}
          <span
            className="italic text-[#6b5ce7]"
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
            }}
          >
            two-week slices
          </span>{" "}
          so you see progress every Friday.
        </h2>

        {/* 5-step timeline */}
        <ol
          role="list"
          className="relative mt-16 list-none space-y-12 p-0 sm:space-y-20"
        >
          {/* Connector line — draws top → bottom as the section
              scrolls into view (CSS scroll-timeline on supporting
              browsers; static-filled fallback elsewhere). The wrapper
              holds the dimmed full-height base; the inner element is
              the bright filling segment driven by .process-rail-fill
              (defined in globals.css, same primitive used by the
              anatomy rail). For vertical fill we re-purpose the
              keyframe with a different transform target — see
              process-steps-line-draw in globals.css. */}
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-8 left-[23px] top-8 w-px overflow-hidden sm:left-[31px]"
          >
            {/* Base track — always-visible dim line */}
            <span
              aria-hidden
              className="absolute inset-0 bg-primary/20"
            />
            {/* Drawing fill — fills from top to bottom on scroll */}
            <span
              aria-hidden
              className="process-steps-line-draw absolute left-0 right-0 top-0 bg-gradient-to-b from-primary via-primary to-primary/0"
            />
          </span>

          {STEPS.map((step, idx) => (
            <AnimateIn
              as="li"
              key={step.numeral}
              y={28}
              /* Card body lands at the standard stagger delay
                 (idx * 0.06s); the numeral marker below arrives
                 ~80ms earlier to create a micro-parallax that
                 guides the eye down the rail. */
              delay={idx * 0.06 + 0.08}
              className="relative pl-16 sm:pl-24"
            >
              {/* Numeral marker — paints over the connector line.
                  Wrapped in its own AnimateIn so it animates in
                  AHEAD of the card body (parallax). The numeral
                  is positioned absolutely so the inner AnimateIn
                  wrapper can hold the slide animation without
                  disturbing layout. */}
              <AnimateIn
                y={16}
                delay={idx * 0.06}
                className="absolute left-0 top-0"
              >
                <span
                  aria-hidden
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-background text-lg font-semibold tracking-tight text-primary"
                >
                  {step.numeral}
                </span>
              </AnimateIn>

              <MagicCard className="p-6 sm:p-8 lg:p-10">
                <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 sm:pb-6">
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

                <p className="mt-6 text-lg leading-relaxed text-foreground-mid sm:text-xl">
                  {step.body}
                </p>

                <div className="mt-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
                    In your hands
                  </p>
                  <ul className="mt-4 space-y-2">
                    {step.deliverables.map((deliverable) => (
                      <li
                        key={deliverable}
                        className="flex items-start gap-3 text-base text-foreground-mid sm:text-lg"
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
            </AnimateIn>
          ))}
        </ol>
      </div>
    </section>
  );
}
