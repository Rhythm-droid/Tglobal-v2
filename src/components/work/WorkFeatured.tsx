"use client";

import { Clock } from "lucide-react";

import { BorderBeam, MagicCard, NumberTicker } from "@/components/primitives";
import type { CaseStudy } from "@/app/work/data";

/**
 * WorkFeatured — the marquee tile.
 *
 * Wraps the boss's pick (MedCollect by default) in a 9-second
 * violet → purple BorderBeam orbit so it pulls focus before the grid.
 * Layout is a 12-col split:
 *
 *   • Left (cols 1–7) — a CSS-only "dashboard" panel that mocks the
 *     real product's chrome (header bar, sidebar nav, stat tiles, a
 *     live-looking chart). Real screenshots aren't shipped yet, so
 *     instead of a placeholder rectangle we render a typography-only
 *     mock that looks intentional. Per-card accent color tints the
 *     active row + chart line.
 *
 *   • Right (cols 8–12) — copy block: industry/region/year tag row,
 *     client name, outcome line, stack, two NumberTicker stats, CTA.
 *
 * Hover lifts the chart line + intensifies the gradient via MagicCard.
 * Focus-visible on the link reveals the focus ring around the whole
 * card surface for keyboard users.
 */
export default function WorkFeatured({ study }: { study: CaseStudy }) {
  const accent = study.accentColor;
  return (
    <section
      aria-labelledby="featured-heading"
      className="bg-background py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
        {/* Section meta — sits above the marquee tile so the page reads
            as labeled chapters, not a continuous scroll of cards. */}
        <div className="flex items-baseline justify-between gap-6 mb-6 sm:mb-8">
          <p
            id="featured-heading"
            className="font-mono text-xs sm:text-[13px] uppercase tracking-[0.18em] text-muted"
            style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
          >
            N° 03 — Featured engagement
          </p>
          <p
            className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.18em] text-muted tabular-nums hidden sm:block"
            style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
          >
            01 / {String(10).padStart(2, "0")}
          </p>
        </div>

        {/* Case study write-ups are not published yet — the wrapping
            element is a non-interactive `<article>` (was `<Link>` until
            we blocked nav to /work/[slug]). All visual affordances
            stay; only the click target is removed. */}
        <article className="block group" aria-labelledby={`featured-client-${study.slug}`}>
          <BorderBeam
            duration={9}
            borderRadius={28}
            colorStart={accent}
            colorEnd="#4b28ff"
            className="rounded-[28px]"
          >
            <MagicCard
              as="article"
              glowColor={`${accent}33`}
              radius={520}
              className="h-full rounded-[26px] bg-surface-alt p-6 sm:p-8 lg:p-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-stretch">
                {/* ─── LEFT — product mock panel ─────────────────── */}
                <div className="lg:col-span-7 relative">
                  <FeaturedDashboardMock study={study} accent={accent} />
                </div>

                {/* ─── RIGHT — copy block ────────────────────────── */}
                <div className="lg:col-span-5 flex flex-col">
                  {/* Tag row — industry · region · year. Switched
                      from mono to Albert Sans + tight tracking so
                      the values read as data, not decoration. Mono
                      stays on the section header + indices, where
                      the editorial chrome belongs. Gains ink emphasis
                      on group-hover, matching the grid card pattern. */}
                  <div className="flex items-center gap-3 text-xs sm:text-[13px] uppercase font-medium tracking-[0.08em] text-muted transition-colors duration-300 group-hover:text-foreground/80">
                    <span>{study.industry}</span>
                    <span aria-hidden className="text-border-mid">·</span>
                    <span>{study.region}</span>
                    <span aria-hidden className="text-border-mid">·</span>
                    <span className="tabular-nums">{study.year}</span>
                  </div>

                  {/* Client name + outcome stack */}
                  <div className="mt-5">
                    <h3
                      id={`featured-client-${study.slug}`}
                      className="font-medium text-foreground leading-[0.98]"
                      style={{
                        fontSize: "clamp(32px, 4vw, 56px)",
                        letterSpacing: "-0.045em",
                      }}
                    >
                      {study.client}
                    </h3>
                    <p className="mt-4 text-lg sm:text-xl leading-snug text-foreground/85 max-w-prose transition-colors duration-300 group-hover:text-foreground">
                      {study.outcome}
                    </p>
                  </div>

                  {/* Stack chips — converted from a dot-separated
                      mono string to individual bordered pills, same
                      treatment as the grid cards. Each token gets
                      its own visual boundary so the eye can land on
                      one without parsing separators. */}
                  <ul className="mt-6 flex flex-wrap items-center gap-1.5" aria-label="Tech stack">
                    {study.stackCompact.map((tech) => (
                      <li
                        key={tech}
                        className="inline-flex items-center rounded-md border border-border/70 bg-background/40 px-2.5 py-1 font-mono text-[12px] sm:text-[13px] text-foreground/80 leading-none"
                        style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>

                  {/* Stats — Tier 4 typography reform: cardStats[0]
                      is promoted to a display headline (the metric IS
                      the story), cardStats[1] demoted to a supporting
                      caption line. Featured tile scale is bigger than
                      grid cards (clamp ceiling 80 vs 56) because it
                      has more room and is the marquee. Numbers stay
                      in ink (text-foreground); brand cue lives in the
                      accent bar above to dodge WCAG AA contrast
                      failures for amber/yellow/orange clients. */}
                  <div className="mt-8 pt-6 border-t border-border/70">
                    {/* Hero stat */}
                    <span
                      aria-hidden
                      className="block h-[3px] w-10 rounded-full mb-3"
                      style={{ background: accent }}
                    />
                    <p
                      className="font-medium text-foreground tracking-[-0.04em] leading-[0.9] origin-left transition-transform duration-300 group-hover:scale-[1.025]"
                      style={{ fontSize: "clamp(44px, 5vw, 80px)" }}
                    >
                      <StatValue value={study.cardStats[0].value} />
                    </p>
                    <p className="mt-2 text-sm sm:text-base text-muted leading-tight max-w-[36ch]">
                      {study.cardStats[0].label}
                    </p>

                    {/* Secondary stat — quiet metadata line. */}
                    <div
                      className="mt-5 pt-4 border-t border-border/50 flex items-baseline gap-2 font-mono text-[12px]"
                      style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
                    >
                      <span className="font-medium text-foreground/85 tracking-tight transition-colors duration-300 group-hover:text-foreground">
                        {study.cardStats[1].value}
                      </span>
                      <span aria-hidden className="text-border-mid">·</span>
                      <span className="uppercase tracking-[0.14em] text-muted">
                        {study.cardStats[1].label}
                      </span>
                    </div>
                  </div>

                  {/* Footer — project status (left) + case-study
                      write-up status (right). The right-side
                      "Coming soon" replaces the original "See the
                      build" link CTA while case study detail pages
                      are off-limits. Clock icon + quiet copy reads
                      as intentional, not as a broken link. */}
                  <div className="mt-auto pt-8 flex items-center justify-between gap-4">
                    <span
                      className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-foreground/70"
                      style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
                    >
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
                      />
                      {study.status}
                    </span>
                    <span
                      className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-muted"
                      style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
                    >
                      <Clock aria-hidden className="h-3.5 w-3.5" />
                      Case study coming soon
                    </span>
                  </div>
                </div>
              </div>
            </MagicCard>
          </BorderBeam>
        </article>
      </div>
    </section>
  );
}

/* ─── Inner: product dashboard mock ────────────────────────────────
   A typography-only mock of the MedCollect dashboard. Reads as a real
   product surface (header bar, sidebar nav, stat tiles, sparkline)
   without shipping any image weight. The accent prop tints the active
   chart line + the active sidebar pill so each featured client gets a
   visually distinct mock. Mock is decorative — aria-hidden so screen
   readers skip it (the copy block on the right is the canonical
   information). */
function FeaturedDashboardMock({
  study,
  accent,
}: {
  study: CaseStudy;
  accent: string;
}) {
  return (
    <div
      aria-hidden
      className="relative h-full min-h-[320px] sm:min-h-[400px] lg:min-h-[460px] overflow-hidden rounded-2xl bg-foreground text-background"
      style={{
        background: `linear-gradient(140deg, #0E0A1E 0%, #03020B 65%, ${accent}22 100%)`,
      }}
    >
      {/* Soft accent bloom */}
      <div
        className="absolute -top-32 -right-32 h-64 w-64 rounded-full pointer-events-none"
        style={{ background: accent, filter: "blur(120px)", opacity: 0.4 }}
      />

      {/* Cinematic top-light — same raking-light language as the
          grid covers. Ellipse anchored at the top centre, fading
          to transparent by 70%. Makes the dark gradient feel lit,
          not slab-painted. */}
      <div
        className="absolute inset-x-0 top-0 h-2/3 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 35%, transparent 70%)",
        }}
      />

      {/* Noise grain overlay — inline SVG turbulence at low opacity
          with `mix-blend-mode: overlay`, so the gradient underneath
          picks up film-grain texture without losing saturation. Same
          recipe as the grid covers; here the panel is taller, so we
          let the 240px tile repeat. Adds the "editorial feel" 2026
          surface treatment for ~200 bytes inline. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: "240px 240px",
          opacity: 0.14,
          mixBlendMode: "overlay",
        }}
      />

      {/* Faux app chrome — top bar */}
      <div className="relative flex items-center justify-between border-b border-background/10 px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-background/20" />
          <span className="h-2 w-2 rounded-full bg-background/20" />
          <span className="h-2 w-2 rounded-full bg-background/20" />
        </div>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-background/55"
          style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
        >
          {study.client.toLowerCase()}.app
        </p>
        <span
          className="rounded-full px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.18em] text-background"
          style={{
            background: accent,
            color: "#fff",
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
          }}
        >
          live
        </span>
      </div>

      <div className="relative grid grid-cols-12 gap-3 sm:gap-4 p-4 sm:p-6">
        {/* Sidebar nav */}
        <div className="col-span-3 flex flex-col gap-1.5">
          {["Inbox", "Claims", "Patients", "Billing", "Audit"].map(
            (label, idx) => {
              const active = idx === 1;
              return (
                <div
                  key={label}
                  className={
                    "rounded-md px-2.5 py-1.5 text-[10px] sm:text-[11px] font-medium tracking-tight " +
                    (active
                      ? "text-background"
                      : "text-background/55 hover:text-background/80")
                  }
                  style={
                    active
                      ? {
                          background: `${accent}22`,
                          color: accent,
                          boxShadow: `inset 0 0 0 1px ${accent}55`,
                        }
                      : undefined
                  }
                >
                  {label}
                </div>
              );
            },
          )}
        </div>

        {/* Main pane */}
        <div className="col-span-9 flex flex-col gap-3 sm:gap-4">
          {/* Stat tiles row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {study.cardStats.concat([study.cardStats[0]]).slice(0, 3).map((s, i) => (
              <div
                key={`${s.label}-${i}`}
                className="rounded-lg border border-background/10 bg-background/[0.04] px-3 py-2.5"
              >
                <p
                  className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.18em] text-background/55"
                  style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
                >
                  {s.label.slice(0, 18)}
                </p>
                <p
                  className="mt-1 text-base sm:text-lg font-medium tracking-tight"
                  style={{ color: i === 0 ? accent : undefined }}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Chart — pure SVG sparkline with the accent color */}
          <div className="flex-1 rounded-lg border border-background/10 bg-background/[0.04] p-3 sm:p-4 min-h-[140px] sm:min-h-[180px]">
            <div className="flex items-baseline justify-between mb-2">
              <p
                className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-background/55"
                style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
              >
                claims · 30d
              </p>
              <p
                className="font-mono text-[9px] sm:text-[10px] tabular-nums"
                style={{
                  fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                  color: accent,
                }}
              >
                <NumberTicker value={2847} suffix=" submitted" />
              </p>
            </div>
            <svg
              viewBox="0 0 300 80"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={`spark-${study.slug}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={accent} stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[20, 40, 60].map((y) => (
                <line
                  key={y}
                  x1="0"
                  x2="300"
                  y1={y}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />
              ))}
              {/* Area + line — hand-tuned to look like a real claims-up
                  trend (noisy growth, dips on weekends). */}
              <path
                d="M0,62 L20,58 L40,55 L60,48 L80,52 L100,42 L120,38 L140,32 L160,36 L180,24 L200,28 L220,18 L240,22 L260,14 L280,12 L300,8 L300,80 L0,80 Z"
                fill={`url(#spark-${study.slug})`}
              />
              <path
                d="M0,62 L20,58 L40,55 L60,48 L80,52 L100,42 L120,38 L140,32 L160,36 L180,24 L200,28 L220,18 L240,22 L260,14 L280,12 L300,8"
                fill="none"
                stroke={accent}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Stat value renderer ─────────────────────────────────────────
   Renders raw string when the value isn't a pure number (e.g. "<12s",
   "150K+", "837P"). If we ever pass a pure integer/decimal we route
   through NumberTicker for the count-up animation on viewport enter. */
function StatValue({ value }: { value: string }) {
  const cleaned = value.replace(/[+%,]/g, "").trim();
  const isPureNumber = /^-?\d+(\.\d+)?$/.test(cleaned);
  if (!isPureNumber) return <span>{value}</span>;

  const num = Number(cleaned);
  const suffix = value.endsWith("%") ? "%" : value.endsWith("+") ? "+" : "";
  return <NumberTicker value={num} suffix={suffix} />;
}
