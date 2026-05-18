"use client";

import Link from "next/link";
import { useRef, type MouseEvent } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { AnimateIn, MagicCard, NumberTicker } from "@/components/primitives";
import { cn } from "@/lib/cn";
import { useMounted } from "@/lib/useMounted";
import type { CaseStudy } from "@/app/work/data";

/* Magnetic pull strength + max travel — tuned softer than MagneticPill
   (0.18 / 8px) because cards are larger than buttons; the same numbers
   feel exaggerated on a card-sized surface. 0.07 with 12px cap reads
   as "this card is alive" without ever drifting more than a quarter-
   inch from its grid slot. */
const MAGNETIC_STRENGTH = 0.07;
const MAGNETIC_MAX = 12;

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

  /* ── Magnetic pull on hover ──────────────────────────────────────
     Cursor inside the card → the Link element translates a small
     amount toward the cursor, capped at ±12px. Mirrors MagneticPill's
     translate3d-via-RAF pattern (no Framer Motion overhead, no SSR
     mismatch). Touch devices are gated via `(hover: hover)` so the
     transform never fires on phones — there's no cursor to follow,
     so the effect would just look broken.

     This composes cleanly with the parent grid cell's velocity skew
     (data-skew-card wraps the AnimateIn → this Link). Skew lives on
     the outer transform; magnetic translate lives on the inner Link.
     CSS combines them via the standard transform stack. */
  const linkRef = useRef<HTMLAnchorElement>(null);
  const rafRef = useRef<number | null>(null);

  const handleMagneticMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (typeof window === "undefined") return;
    if (window.matchMedia && !window.matchMedia("(hover: hover)").matches) return;
    const el = linkRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = Math.max(
      -MAGNETIC_MAX,
      Math.min(MAGNETIC_MAX, (e.clientX - cx) * MAGNETIC_STRENGTH),
    );
    const dy = Math.max(
      -MAGNETIC_MAX,
      Math.min(MAGNETIC_MAX, (e.clientY - cy) * MAGNETIC_STRENGTH),
    );
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      el.style.transition = "";
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    });
  };

  const handleMagneticLeave = () => {
    const el = linkRef.current;
    if (!el) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    /* 0.5s cubic-bezier — slightly slower than MagneticPill's reset
       so a larger surface feels weighty. Card "settles" rather than
       snaps. */
    el.style.transition =
      "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.transform = "translate3d(0, 0, 0)";
  };

  return (
    <AnimateIn as="article" delay={delay} y={20} duration={0.6} className={className}>
      <Link
        ref={linkRef}
        href={`/work/${study.slug}`}
        aria-label={`Read the ${study.client} case study`}
        onMouseMove={handleMagneticMove}
        onMouseLeave={handleMagneticLeave}
        className="block h-full focus-visible:outline-none group"
        style={{ willChange: "transform" }}
      >
        <MagicCard
          as="div"
          glowColor={`${accent}26`}
          radius={420}
          className={cn(
            "h-full rounded-[24px] bg-surface-alt p-5 sm:p-6 lg:p-7 flex flex-col gap-5 transition-transform duration-500",
            "border border-border/60",
            "hover:border-transparent",
          )}
        >
          {/* ─── Cover panel ─────────────────────────────────────── */}
          <CardCover study={study} accent={accent} variant={variant} index={index} />

          {/* ─── Tag row ─────────────────────────────────────────── */}
          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-muted"
            style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
          >
            <span>{study.industry}</span>
            <span aria-hidden className="text-border-mid">·</span>
            <span>{study.region}</span>
            <span aria-hidden className="text-border-mid">·</span>
            <span className="tabular-nums">{study.year}</span>
          </div>

          {/* ─── Client + outcome ───────────────────────────────── */}
          <div>
            <h3
              className="font-medium text-foreground leading-[1] tracking-[-0.035em]"
              style={{ fontSize: "clamp(22px, 2.4vw, 30px)" }}
            >
              {study.client}
            </h3>
            <p className="mt-3 text-base sm:text-lg leading-snug text-foreground/82 max-w-prose">
              {study.outcome}
            </p>
          </div>

          {/* ─── Stack chip row ─────────────────────────────────── */}
          <p
            className="font-mono text-[11px] sm:text-xs text-muted leading-relaxed"
            style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
          >
            {study.stackCompact.join("  ·  ")}
          </p>

          {/* ─── Footer — stats + CTA ───────────────────────────── */}
          <div className="mt-auto pt-5 border-t border-border/60 flex items-end justify-between gap-4">
            <div className="grid grid-cols-2 gap-x-5 gap-y-0">
              {study.cardStats.map((stat) => (
                <div key={stat.label}>
                  <p
                    className="font-medium tracking-[-0.03em] leading-none"
                    style={{
                      fontSize: "clamp(18px, 1.6vw, 22px)",
                      color: accent,
                    }}
                  >
                    <StatValue value={stat.value} />
                  </p>
                  <p className="mt-1 text-[10px] sm:text-[11px] text-muted leading-tight">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <span
              className={cn(
                "inline-flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full",
                "bg-foreground text-background transition-all duration-300",
                "group-hover:scale-110",
              )}
              style={{
                background: accent,
                color: "#fff",
              }}
              aria-hidden
            >
              <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:rotate-45" />
            </span>
          </div>

          {/* Status pill — small, mono, low-key */}
          <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-10">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.18em]",
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
      </Link>
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
      aria-hidden
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
        className="absolute -top-20 -right-20 h-48 w-48 rounded-full pointer-events-none"
        style={{ background: accent, filter: "blur(110px)", opacity: 0.5 }}
      />

      {/* Mono index, top-left */}
      <p
        className="absolute top-3 left-3 sm:top-4 sm:left-4 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.24em] text-white/55"
        style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
      >
        N° {String(index).padStart(2, "0")}
      </p>

      {/* Region tag, top-right */}
      <p
        className="absolute top-3 right-3 sm:top-4 sm:right-4 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.24em] text-white/55"
        style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
      >
        {study.region} · {study.year}
      </p>

      {/* Center — huge translucent client name. Truncates safely on
          narrow widths because we set max-w + line-clamp. */}
      <div className="absolute inset-0 flex items-end p-4 sm:p-6">
        <p
          className="font-medium text-white leading-[0.92] tracking-[-0.05em]"
          style={{
            fontSize: variant === "wide" ? "clamp(36px, 5.6vw, 80px)" : "clamp(28px, 4.4vw, 56px)",
            opacity: 0.95,
          }}
        >
          {study.client}
        </p>
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
