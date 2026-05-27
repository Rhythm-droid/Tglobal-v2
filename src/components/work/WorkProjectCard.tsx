"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Clock } from "lucide-react";

import { AnimateIn, MagicCard, NumberTicker } from "@/components/primitives";
import { cn } from "@/lib/cn";
import { useMounted } from "@/lib/useMounted";
import type { CaseStudy } from "@/app/work/data";

interface WorkProjectCardProps {
  study: CaseStudy;
  /** Visual variant — `wide` tiles get a richer cover panel; `compact`
   *  tiles use a narrower cover so the copy gets more breathing room.
   *  Drives the asymmetric grid rhythm without per-card overrides. */
  variant?: "wide" | "compact";
  /** Staggered entrance delay (seconds). Applied via AnimateIn. */
  delay?: number;
  /** Card index — surfaces as the "N° XX" mono index in the corner. */
  index: number;
  className?: string;
}

/**
 * WorkProjectCard — a single grid tile.
 *
 * Each card mounts a cover panel + a copy block stacked vertically:
 *   • Cover panel — typography-only "product mock" that bakes the
 *     client name + accent gradient. Real cover images can be dropped
 *     in later by reading `study.cover` (the component prefers it
 *     when present).
 *   • Tag row · client name · outcome · stack · two stats · footer.
 *
 * Hover is driven entirely by MagicCard's cursor-follow gradient, plus
 * a transform on the cover panel that scales 1.0 → 1.02. Footer arrow
 * slides right via `group-hover`. Whole card surface is the click
 * target so accessibility audits don't flag a small hit area.
 */
export default function WorkProjectCard({
  study,
  variant = "wide",
  delay = 0,
  index,
  className,
}: WorkProjectCardProps) {
  const accent = study.accentColor;
  const isPlaceholder = study.status === "In production" || study.status === "Coming soon";

  /* Magnetic-pull hover handler was removed when we blocked
     navigation to the (unfinished) /work/[slug] detail pages —
     the pull only makes sense on a clickable surface. The
     parent grid cell's velocity-skew is independent of this and
     stays. The wrapping element is a non-interactive div so the
     card reads as a presentational tile, not a broken link. */

  return (
    <AnimateIn as="article" delay={delay} y={20} duration={0.6} className={className}>
      <div className="block h-full group">
        <MagicCard
          as="div"
          glowColor={`${accent}26`}
          radius={420}
          className={cn(
            /* Padding rhythm bumped (p-5/6/7 → p-6/7/9) and inter-
               section gap loosened (gap-5 → gap-6 sm:gap-7) so the
               card breathes instead of stacking tight. The previous
               density was a result of TWO duplications eating
               vertical space — see notes below. */
            "h-full rounded-[24px] bg-surface-alt p-6 sm:p-7 lg:p-9 flex flex-col gap-6 sm:gap-7 transition-transform duration-500",
            "border border-border/60",
            "hover:border-transparent",
          )}
        >
          {/* Cover panel — the client name + region + year live
              inside the cover now (used to be duplicated as an h3
              + tag row below). With duplications removed the body
              starts at the industry label and goes straight to the
              outcome line, which is what readers actually want. The
              h3 lives inside the cover via aria-labelledby so we
              keep the semantic heading without rendering it twice. */}
          <CardCover study={study} accent={accent} variant={variant} index={index} />

          {/* Industry label — single chip, replaces the old
              industry · region · year tag row. Region and year are
              shown inside the cover's bottom-left dateline so they
              don't need a second appearance here. */}
          <span
            className="inline-flex items-center gap-2 self-start rounded-full border border-border/60 px-3 py-1 text-xs sm:text-[13px] uppercase font-medium tracking-[0.06em] text-foreground/80 transition-colors duration-300 group-hover:border-foreground/35 group-hover:text-foreground"
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full transition-transform duration-300 group-hover:scale-150"
              style={{ background: accent }}
            />
            {study.industry}
          </span>

          {/* Outcome — promoted from a sub-line under the duplicate
              h3 to a primary read. With the client name only
              rendered once (in the cover) the outcome is now the
              first text the reader's eye lands on in the body, so
              it gets bumped to 17-19px and a 42ch measure for a
              calm reading rhythm. On group-hover the body copy
              gains full ink emphasis (foreground/85 → foreground);
              transition is neutralized under prefers-reduced-motion
              by the global * { transition-duration: revert-layer }
              rule in globals.css, so reduced-motion users see the
              end-state snap instantly rather than animate. */}
          <p className="text-[17px] sm:text-lg leading-snug text-foreground/85 max-w-[42ch] transition-colors duration-300 group-hover:text-foreground">
            {study.outcome}
          </p>

          {/* Stack chips — converted from a dot-separated mono
              string to individual bordered pills. Per the Webflow
              card-UI guidance, chip groups beat strings for
              technical-token lists: each item gets its own visual
              boundary so the eye can land on one without having to
              parse separators. Mono stays inside each chip since the
              values are code identifiers. */}
          <ul className="flex flex-wrap items-center gap-1.5" aria-label="Tech stack">
            {study.stackCompact.map((tech) => (
              <li
                key={tech}
                className="inline-flex items-center rounded-md border border-border/70 bg-background/40 px-2 py-1 font-mono text-[11px] text-foreground/75 leading-none"
                style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
              >
                {tech}
              </li>
            ))}
          </ul>

          {/* Footer — hero stat (lead-with-results) + supporting
              caption. Tier 4 typography reform: instead of two equal-
              weight stats fighting for attention, ONE stat is promoted
              to display size as the headline result, and the second
              becomes a quiet mono caption line beneath. Awwwards 2026
              pattern — "the metric is the story." Stat numbers stay
              in ink (text-foreground) because several brand colours
              fail WCAG AA on the off-white surface; the accent bar
              above carries the brand cue. */}
          <div className="mt-auto pt-5 border-t border-border/60">
            <div className="flex items-end justify-between gap-4">
              {/* Hero stat — cardStats[0] is the headline metric.
                  Display size scales with viewport: 34px on mobile up
                  to 56px on wide screens. -4% letter-spacing + 0.9
                  line-height pulls the number into a tight slab so
                  it reads as a single visual object, not loose text. */}
              <div className="flex-1 min-w-0">
                <span
                  aria-hidden
                  className="block h-[2px] w-8 rounded-full mb-2"
                  style={{ background: accent }}
                />
                <p
                  className="font-medium tracking-[-0.04em] leading-[0.9] text-foreground origin-left transition-transform duration-300 group-hover:scale-[1.025]"
                  style={{ fontSize: "clamp(34px, 4.2vw, 56px)" }}
                >
                  <StatValue value={study.cardStats[0].value} />
                </p>
                <p className="mt-2 text-[12px] sm:text-[13px] text-muted leading-tight max-w-[28ch]">
                  {study.cardStats[0].label}
                </p>
              </div>

              {/* "Soon" affordance — sits where the clickable
                  ArrowUpRight badge used to. items-end keeps it
                  pinned to the hero stat's baseline. */}
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.14em] text-muted shrink-0 pb-1"
                style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
              >
                <Clock aria-hidden className="h-3.5 w-3.5" />
                Soon
              </span>
            </div>

            {/* Secondary stat — cardStats[1] demoted to a quiet
                metadata line. Mono value + uppercase-tracked label
                reads as "supporting data", not a competing headline.
                Hairline rule above signals continuation, not a new
                section. */}
            <div
              className="mt-4 pt-3 border-t border-border/40 flex items-baseline gap-2 font-mono text-[11px]"
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

          {/* Status pill — bumped from 9-10px to 11px so the project
              status is actually legible at a glance. Tracking nudged
              to 0.14em to match the "Soon" indicator below. */}
          <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-10">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em]",
                isPlaceholder
                  ? "bg-soft-lavender text-primary"
                  : "bg-foreground text-background",
              )}
              style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
            >
              <span
                aria-hidden
                className="h-1 w-1 rounded-full"
                style={{
                  background: isPlaceholder ? "var(--color-primary)" : accent,
                  boxShadow: isPlaceholder
                    ? "0 0 6px var(--color-primary)"
                    : `0 0 6px ${accent}`,
                }}
              />
              {study.status}
            </span>
          </div>
        </MagicCard>
      </div>
    </AnimateIn>
  );
}

/* ─── Cover panel ─────────────────────────────────────────────────
   Typography-only cover. The client name is rendered huge and translucent
   over a per-card gradient, with a mono index in the corner. When a real
   cover image lands in `study.cover` later, prefer that over the gradient
   (one branch swap, no other changes). */
function CardCover({
  study,
  accent,
  variant,
  index,
}: {
  study: CaseStudy;
  accent: string;
  variant: "wide" | "compact";
  index: number;
}) {
  /* ── Scroll-scrub cover scale ────────────────────────────────────
     The cover panel's INNER content scales 1.08 → 1.0 as the card
     crosses the viewport — feels like the cover "breathes" past the
     reader. Awwwards-grade magazine effect:
       • While off-screen below: scale 1.08 (pre-zoomed)
       • As card enters viewport: scale eases toward 1.0
       • At rest mid-screen: scale 1.0 (final)
       • Past viewport: stays 1.0 (no awkward shrink past final)

     Framer Motion useScroll with `target` = the cover element. The
     offset `["start end", "end start"]` means "track from when the
     bottom of the cover hits the bottom of viewport to when the top
     of the cover leaves the top of viewport" — the cover's full
     scroll life. We map [0, 0.5] → [1.08, 1.0] so the zoom finishes
     before the card reaches the centre of the screen, then stays put.

     Mounted gate prevents SSR hydration mismatch (server renders the
     static scale, client takes over with motion values). */
  const mounted = useMounted();
  const coverRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: coverRef,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1]);

  if (study.cover) {
    return (
      <div
        ref={coverRef}
        aria-hidden
        className="relative overflow-hidden rounded-2xl aspect-[16/10] bg-foreground"
      >
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${study.cover})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            scale: mounted ? scale : 1,
            transformOrigin: "center",
            willChange: "transform",
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={coverRef}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        variant === "wide" ? "aspect-[16/9]" : "aspect-[16/10]",
      )}
    >
      {/* Scaling inner — content lives here so the parent stays a fixed
          aspect-ratio frame. The frame clips overflow, the inner zooms. */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, #0E0A1E 55%, #03020B 100%)`,
          scale: mounted ? scale : 1,
          transformOrigin: "center",
          willChange: "transform",
        }}
      >
      {/* Soft accent bloom — same lavender-blob language as the CTA */}
      <div
        aria-hidden
        className="absolute -top-20 -right-20 h-48 w-48 rounded-full pointer-events-none"
        style={{ background: accent, filter: "blur(110px)", opacity: 0.5 }}
      />

      {/* Cinematic top-light — soft radial gradient at the top edge
          that simulates "raking light" coming in from above. Per the
          2026 editorial-card research this is the single most-cited
          trick for making a flat dark surface feel lit and intentional
          rather than slab-coloured. 8% peak alpha keeps it subtle —
          you read it as ambience, not as a separate UI element. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-2/3 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 0%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 35%, transparent 70%)",
        }}
      />

      {/* Noise grain overlay — inline SVG turbulence with very low
          opacity (~6%) layered with `mix-blend-mode: overlay` so the
          gradient underneath shows through but picks up a film-grain
          texture. The "luxurious editorial feel" 2026 trend. No
          external asset, no JS — just a data URI baked into the
          background-image. Sized at 240px and tiled so it doesn't
          repeat-glitch on wide cards. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: "240px 240px",
          opacity: 0.18,
          mixBlendMode: "overlay",
        }}
      />

      {/* Top-left index — N° XX. The top-right used to also carry a
          "region · year" string, but that duplicated the body's tag
          row and (worse) sat under the absolute status pill. Region
          and year now live as a dateline at the bottom-left next to
          the client name, freeing the top-right for the status pill
          alone. */}
      <p
        aria-hidden
        className="absolute top-3 left-3 sm:top-4 sm:left-4 font-mono text-[11px] uppercase tracking-[0.16em] text-white/65"
        style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
      >
        N° {String(index).padStart(2, "0")}
      </p>

      {/* Bottom — client name as the actual semantic h3 (used to be
          a generic <p> with the same content rendered AGAIN as a
          smaller h3 in the body below the cover; one h3 is correct,
          two was a duplication tax on every card). Region · year
          ride above the name as an editorial dateline so all the
          identity metadata sits in one block. */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
        <p
          aria-hidden
          className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-white/65"
          style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
        >
          {study.region} · {study.year}
        </p>
        <h3
          className="font-medium text-white leading-[0.92] tracking-[-0.05em]"
          style={{
            fontSize: variant === "wide" ? "clamp(36px, 5.6vw, 80px)" : "clamp(28px, 4.4vw, 56px)",
            opacity: 0.95,
          }}
        >
          {study.client}
        </h3>
      </div>

      {/* Hairline frame inside the panel */}
      <div
        aria-hidden
        className="absolute inset-2 sm:inset-3 rounded-xl pointer-events-none"
        style={{
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      />
      </motion.div>
    </div>
  );
}

/* ─── Stat value renderer ─────────────────────────────────────────
   Same logic as the featured card — route pure numbers through
   NumberTicker for count-up animation, render raw strings literally.
   Shared via the data file later if a third card uses it. */
function StatValue({ value }: { value: string }) {
  const cleaned = value.replace(/[+%,]/g, "").trim();
  const isPureNumber = /^-?\d+(\.\d+)?$/.test(cleaned);
  if (!isPureNumber) return <span>{value}</span>;

  const num = Number(cleaned);
  const suffix = value.endsWith("%") ? "%" : value.endsWith("+") ? "+" : "";
  return <NumberTicker value={num} suffix={suffix} />;
}
