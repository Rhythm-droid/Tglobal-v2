"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import WorkProjectCard from "./WorkProjectCard";
import type { CaseStudy } from "@/app/work/data";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface WorkGridProps {
  /** All non-featured case studies, in the order to display. */
  studies: readonly CaseStudy[];
}

/**
 * WorkGrid — the asymmetric 12-col grid of remaining case studies.
 *
 * Layout rhythm (spec §05):
 *   • Row 1 — 7 / 5  (wide left, compact right)
 *   • Row 2 — 5 / 7  (compact left, wide right)
 *   • Row 3 — 4 / 4 / 4 (three equal compacts)
 *   • Row 4+ — 6 / 6 (two equal wides) if more cards remain
 *
 * The pattern repeats if more cards are added. Each card animates in
 * with a staggered AnimateIn delay so the row "lands" together rather
 * than all 9 cards revealing at once. Stagger inside a row is 80ms;
 * between rows it resets.
 *
 * E-commerce constraint (from the spec): we interleave so that the
 * two e-commerce cards (DellStore + Turpai) never sit in the same row.
 * The order coming in from page.tsx already enforces this.
 */
export default function WorkGrid({ studies }: WorkGridProps) {
  /* Slice into rows of [wide, compact], [compact, wide], [c, c, c],
     repeating. Drives both column spans and per-card variant. */
  const rows = buildRows(studies);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Velocity-driven skew on scroll ────────────────────────────
     Codrops/Awwwards signature: while the user scrolls fast, every
     card micro-skews along Y, then springs back to 0 when they stop.
     The faster the velocity, the more skew (clamped at ±7deg so it
     never gets cartoonish). ScrollTrigger.create's onUpdate handler
     gets self.getVelocity() in px/s — divide by ~300 to get a
     sensible deg value.

     Implementation notes:
       • Target = each .work-card directly (not the container) so the
         transform composes cleanly with each card's own hover transform.
       • gsap.to(target, { skewY: 0, ... }) is called every onUpdate
         tick — GSAP's tween overwrite logic merges these, so the card
         eases to the latest target each frame. No tween pile-up.
       • prefers-reduced-motion: skip the registration entirely so
         reduced-motion users see zero skew, ever.
       • Touch devices still benefit (momentum scrolling has velocity)
         so we keep this on every viewport — degrades cleanly. */
  useGSAP(
    () => {
      if (typeof window === "undefined") return;
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }
      const cards = containerRef.current?.querySelectorAll<HTMLElement>(
        "[data-skew-card]",
      );
      if (!cards || cards.length === 0) return;

      const trigger = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate(self) {
          /* Clamp prevents extreme values when the browser reports a
             velocity spike (e.g. trackpad fling). 7deg max keeps the
             effect kinetic but never goofy. */
          const skew = gsap.utils.clamp(-7, 7, self.getVelocity() / 320);
          gsap.to(cards, {
            skewY: skew,
            duration: 0.55,
            ease: "power3.out",
            overwrite: "auto",
          });
        },
      });

      return () => trigger.kill();
    },
    { scope: containerRef },
  );

  return (
    <section
      aria-labelledby="grid-heading"
      /* Added top padding (was bare 0) so the section seam between
         the Featured tile and the Grid reads as a deliberate break,
         not a continuation. Featured's bottom is `py-16/20/24`;
         matching `pt-12/16/20` here gives the grid heading room to
         breathe without doubling the rhythm. */
      className="bg-background pt-12 sm:pt-16 lg:pt-20 pb-20 sm:pb-28 lg:pb-32"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
        <div className="flex items-baseline justify-between gap-6 mb-6 sm:mb-8">
          <p
            id="grid-heading"
            className="font-mono text-xs sm:text-[13px] uppercase tracking-[0.18em] text-muted"
            style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
          >
            N° 04 — Case studies
          </p>
          <p
            className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.18em] text-muted tabular-nums hidden sm:block"
            style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
          >
            {String(studies.length).padStart(2, "0")} engagements
          </p>
        </div>

        <div
          ref={containerRef}
          className="grid grid-cols-1 sm:grid-cols-12 gap-5 sm:gap-6 lg:gap-7"
        >
          {rows.flatMap((row, rowIdx) =>
            row.map((cell, colIdx) => (
              <div
                key={cell.study.slug}
                data-skew-card
                className={cell.colClass}
                style={{ willChange: "transform", transformOrigin: "center" }}
              >
                <WorkProjectCard
                  study={cell.study}
                  variant={cell.variant}
                  delay={colIdx * 0.08}
                  /* Index = (rowIdx * 3) + colIdx + 2 puts the first grid
                     card at "N° 02" right after the featured (N° 01).
                     Padded later to 2 digits inside the cover panel. */
                  index={rowIdx * 3 + colIdx + 2}
                />
              </div>
            )),
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── Row builder ─────────────────────────────────────────────────
   Walks the input array and groups it into rows according to the
   asymmetric rhythm: 7+5, 5+7, 4+4+4, repeating. Each cell carries
   its column-span class and variant so the consumer can render in a
   single flat loop. */
type RowCell = {
  study: CaseStudy;
  colClass: string;
  variant: "wide" | "compact";
};

function buildRows(studies: readonly CaseStudy[]): RowCell[][] {
  const rhythm: {
    cols: ReadonlyArray<{ span: string; variant: "wide" | "compact" }>;
  }[] = [
    {
      cols: [
        { span: "sm:col-span-7", variant: "wide" },
        { span: "sm:col-span-5", variant: "compact" },
      ],
    },
    {
      cols: [
        { span: "sm:col-span-5", variant: "compact" },
        { span: "sm:col-span-7", variant: "wide" },
      ],
    },
    {
      cols: [
        { span: "sm:col-span-4", variant: "compact" },
        { span: "sm:col-span-4", variant: "compact" },
        { span: "sm:col-span-4", variant: "compact" },
      ],
    },
    {
      cols: [
        { span: "sm:col-span-6", variant: "wide" },
        { span: "sm:col-span-6", variant: "wide" },
      ],
    },
  ];

  const rows: RowCell[][] = [];
  let i = 0;
  let rhythmIdx = 0;
  while (i < studies.length) {
    const pattern = rhythm[rhythmIdx % rhythm.length]!;
    const row: RowCell[] = [];
    for (const col of pattern.cols) {
      if (i >= studies.length) break;
      row.push({
        study: studies[i]!,
        colClass: col.span,
        variant: col.variant,
      });
      i++;
    }
    rows.push(row);
    rhythmIdx++;
  }
  return rows;
}
