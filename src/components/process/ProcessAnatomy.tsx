import { AnimateIn } from "@/components/primitives";

/* ProcessAnatomy — horizontal scrubbed timeline rail.
   ─────────────────────────────────────────────────────────────
   Each day docks to a long horizontal rail like calendar entries
   on a Gantt strip. A brand-purple bar fills the rail left → right
   as the user scrolls the section into view (CSS scroll-timeline
   on supporting browsers; static-filled fallback elsewhere).

   Departs from the about-page tile-grid pattern by anchoring
   tiles to a single continuous rail — the reader feels sprint-
   time moving forward instead of seeing 10 independent tiles.

   Mobile: rail still renders horizontally and scrolls right via
   overflow-x. Tile width is preserved so the visual story stays
   linear even on narrow viewports. */

interface SprintDay {
  readonly day: string;
  readonly focus: string;
  readonly badge?: "halfway" | "ship";
}

const DAYS: readonly SprintDay[] = [
  { day: "Mon W1", focus: "Spec. Tickets. Branches. No flux." },
  { day: "Tue W1", focus: "Tuesday's parallel push. API. UI. No wait." },
  { day: "Wed W1", focus: "Test green. Async posted. Momentum builds." },
  { day: "Thu W1", focus: "Thursday hard stop. Scope locked or shifted." },
  {
    day: "Fri W1",
    focus: "Staging. Demo. Recorded. Next week: harden and ship.",
    badge: "halfway",
  },
  { day: "Mon W2", focus: "Edge cases. Performance. Telemetry hooks added." },
  { day: "Tue W2", focus: "Code review. Coverage. Quality gates locked." },
  { day: "Wed W2", focus: "Docs written. Runbook updated. Bug bash." },
  { day: "Thu W2", focus: "Deploy code Thursday. Feature flag controls ramp. Safe." },
  { day: "Fri W2", focus: "Live. Reviewed. Repeat.", badge: "ship" },
];

export default function ProcessAnatomy() {
  return (
    <section
      id="process-anatomy"
      aria-labelledby="process-anatomy-heading"
      className="relative w-full border-y border-border bg-background py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
        {/* Eyebrow */}
        <p
          className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.22em] text-foreground-mid"
          style={{
            fontFamily:
              "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          <span className="tabular-nums">№ 04</span>
          <span aria-hidden className="h-px w-8 bg-foreground-mid/40" />
          <span>Ten days. One shipping week.</span>
        </p>

        <h2
          id="process-anatomy-heading"
          /* max-w-5xl + slightly tighter font cap so the 41-char
             headline fits ONE visual line from lg upward. Previously
             max-w-4xl + clamp(...,72px) forced "Friday ships." to
             wrap to its own line on 1280-laptop, splitting the
             sentence-and-its-italic-anchor across two rows. */
          className="mt-6 max-w-5xl font-medium leading-tight text-foreground"
          style={{
            fontSize: "clamp(32px, 5vw, 64px)",
            letterSpacing: "-0.045em",
          }}
        >
          Monday spec locks. Friday{" "}
          <span
            className="italic text-[#6b5ce7]"
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
            }}
          >
            ships
          </span>
          .
        </h2>
      </div>

      {/* Rail — full-bleed, horizontally scrollable on overflow. */}
      <div className="relative mt-14 w-full sm:mt-20">
        {/* tabIndex + role="region" make the horizontal scroll
            container keyboard accessible — axe-core rule
            scrollable-region-focusable. Without tabIndex, screen
            reader and keyboard-only users could not scroll the
            day rail to read days 6-10. */}
        <div
          className="horizontal-scroll w-full overflow-x-auto"
          role="region"
          aria-label="Day-by-day sprint timeline. Use arrow keys to scroll."
          tabIndex={0}
        >
          <div className="relative mx-auto w-max min-w-full px-6 pb-10 sm:px-8 lg:px-14 xl:px-20">
            {/* Day labels strip — sits above the rail */}
            <ul
              role="list"
              className="flex list-none items-end gap-0 p-0"
              style={{
                fontFamily:
                  "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              {DAYS.map((day, idx) => (
                <li
                  key={day.day}
                  className="relative flex w-[200px] shrink-0 flex-col items-start gap-2 sm:w-[220px] lg:w-[240px]"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/55 tabular-nums">
                    Day {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                    {day.day}
                  </span>
                </li>
              ))}
            </ul>

            {/* Rail line — scrubs left → right as user scrolls the
                section into view. The track sits behind the dots;
                the fill renders on top as a brand-purple bar. */}
            <div className="relative mt-4 h-1.5">
              <div
                aria-hidden
                className="absolute inset-0 rounded-full bg-border"
              />
              <div
                aria-hidden
                className="process-rail-fill absolute inset-y-0 left-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, #4b28ff 0%, #bd70f6 100%)",
                }}
              />
            </div>

            {/* Dots strip — one circular node per day, anchored to the
                rail. The active dot for Fri W2 (climax) gets a halo. */}
            <ul
              role="list"
              className="-mt-[7px] flex list-none items-center gap-0 p-0"
            >
              {DAYS.map((day) => (
                <li
                  key={day.day}
                  className="relative flex w-[220px] shrink-0 sm:w-[240px] lg:w-[260px]"
                >
                  <span
                    aria-hidden
                    className={[
                      "block h-3 w-3 rounded-full",
                      day.badge === "ship"
                        ? "bg-foreground process-anatomy-pulse-strong"
                        : day.badge === "halfway"
                          ? "bg-primary process-anatomy-pulse"
                          : "bg-primary",
                    ].join(" ")}
                  />
                </li>
              ))}
            </ul>

            {/* Tile bodies — each day's focus line. */}
            <ul role="list" className="mt-6 flex list-none items-stretch gap-0 p-0">
              {DAYS.map((day, idx) => (
                <li
                  key={day.day}
                  className="relative w-[220px] shrink-0 pr-5 sm:w-[240px] lg:w-[260px]"
                >
                  <AnimateIn y={16} delay={idx * 0.04}>
                    {/* Linear Changelog hover pattern: the whole
                        tile reacts (border + padding + shadow) on
                        hover, not just the border. Treats the day
                        as one clickable region rather than separate
                        parts. */}
                    <div
                      className={[
                        "group/tile relative h-full rounded-xl border bg-background p-4 transition-all duration-200",
                        day.badge === "ship"
                          ? "border-primary shadow-[0_18px_48px_-22px_rgba(75,40,255,0.45)]"
                          : day.badge === "halfway"
                            ? "border-primary/40 hover:border-primary hover:shadow-[0_18px_48px_-26px_rgba(75,40,255,0.32)]"
                            : "border-border hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-[0_14px_36px_-20px_rgba(75,40,255,0.22)]",
                      ].join(" ")}
                    >
                      {day.badge === "halfway" ? (
                        <span
                          aria-hidden
                          className="absolute -top-3 right-3 rounded-full bg-primary px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-background"
                          style={{
                            fontFamily:
                              "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
                          }}
                        >
                          Five days in
                        </span>
                      ) : null}
                      {day.badge === "ship" ? (
                        <span
                          aria-hidden
                          className="absolute -top-3 right-3 rounded-full bg-foreground px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-background"
                          style={{
                            fontFamily:
                              "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
                          }}
                        >
                          Ship
                        </span>
                      ) : null}
                      <p className="text-sm leading-relaxed text-foreground-mid">
                        {day.focus}
                      </p>
                    </div>
                  </AnimateIn>
                </li>
              ))}
            </ul>

            {/* Hint when content overflows on narrow viewports.
                text-foreground-mid (no /70 modifier): the dimmed
                variant resolved to #797979 on #ffffff = 4.35:1, just
                under WCAG AA 4.5:1. Solid token clears the bar. */}
            <p
              className="mt-6 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground-mid sm:hidden"
              style={{
                fontFamily:
                  "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              <span aria-hidden>→</span>
              <span>Scroll the rail to walk the sprint</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
