"use client";

import { useEffect, useRef, useState } from "react";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { AnimateIn, MaskReveal } from "@/components/primitives";
import { ScrollBasedVelocity } from "@/components/ui/scroll-based-velocity";

/* Work strip — bento case-study row, stat-as-hero.
   ─────────────────────────────────────────────────────────────
   Layout (lg+):
     Row 1: [── Skyline (col-7) ──][── MedCollect (col-5) ──]
     Row 2: [───────── Jijibai (col-12 banner) ───────────]

   Each card leads with the BIG NUMBER (the trust signal) as a
   90-160px display value that counts up on viewport enter. The
   number IS the hero image. Stripe / Linear / Mercury all do
   this for case-study previews — works without screenshots and
   makes the data, not the company logo, the loudest thing.

   Per-card decorations:
     • "Live" pulse — green dot + mono caps top-right. Signals
       "still in production right now" without needing a status
       page or screenshot.
     • Subtle accent radial bloom — bottom-right of the card,
       tinted with the case's brand accent. Reads as the stat
       "warming" the card from below.
     • Hairline border that thickens slightly on hover.
     • Bottom accent rule grows 12 → 96px on hover (kept from
       the previous design — the "premium grow-into-place"
       gesture).

   No Warp shaders, no image dependency. When real screenshots
   land, drop them at /public/work/<slug>.jpg and they'll appear
   as a low-opacity background behind the stat (the component
   does the asset existence check and switches render path). */

interface CaseStudy {
  readonly slug: string;
  readonly tagline: string;
  readonly client: string;
  readonly headline: string;
  /* Display value for the stat hero. Format-agnostic — can be
     "38" + suffix "%", or a "14 → 4" rate, or a "19" + "DAYS"
     unit. Numeric `target` is used for the count-up animation;
     `prefix`/`suffix` render around it without animating. The
     `formatRate` flag swaps in a "before → after" rendering for
     cases where two numbers tell the story better than one. */
  readonly stat: {
    readonly prefix?: string;
    readonly target: number;
    readonly suffix?: string;
    readonly rateFrom?: number;
    readonly rateTo?: number;
    readonly unit: string;
  };
  readonly outcome: string;
  readonly services: readonly string[];
  readonly accent: string;
  readonly status: "Live" | "Archived";
}

const CASES: readonly CaseStudy[] = [
  {
    slug: "skyline",
    tagline: "Travel · 2024",
    client: "Skyline",
    headline: "Booking flow rebuilt in two sprints.",
    stat: { prefix: "+", target: 38, suffix: "%", unit: "conversion lift" },
    outcome: "Audit-clean cutover, zero downtime in production.",
    services: ["React", "Postgres", "Stripe"],
    accent: "#4b28ff",
    status: "Live",
  },
  {
    slug: "medcollect",
    tagline: "Healthcare · 2024",
    client: "MedCollect",
    headline: "Clinical intake from 14 mins to 4.",
    stat: { rateFrom: 14, rateTo: 4, target: 4, unit: "minutes per intake" },
    outcome: "Audit-ready logs, 0 PHI leaks at launch.",
    services: ["Next.js", "OpenAI", "HIPAA"],
    accent: "#fc5038",
    status: "Live",
  },
  {
    slug: "jijibai",
    tagline: "Marketplace · 2023",
    client: "Jijibai",
    headline: "Marketplace shipped before the launch press.",
    stat: { target: 19, suffix: " days", unit: "concept → production" },
    outcome: "Built, reviewed, deployed, indexed.",
    services: ["Remix", "Supabase", "Algolia"],
    accent: "#00a656",
    status: "Live",
  },
];

/* Count-up hook — counts from 0 to `target` over `duration` ms
   when `start` flips to true. Uses requestAnimationFrame for
   smooth interpolation and bails cleanly on unmount. Eased with
   a quart-out curve so the count decelerates into its final
   value rather than landing flat. */
function useCountUp(target: number, start: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration]);
  return value;
}

/* Viewport-enter trigger. Returns true once the element has
   intersected the viewport. Locks at true (doesn't reset on
   exit) so the count-up only ever runs once. */
function useEnteredViewport<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setEntered(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setEntered(true);
            obs.disconnect();
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);
  return { ref, entered };
}

/* Stat hero — renders the case study's big number. Two paths:
     • rate     → "14 → 4" with both values count-up
     • single   → "+38%" or "19 days" with one value count-up
   Display sizes are responsive clamps tuned so the stat anchors
   the card visually without overflowing on smaller cards. */
function StatHero({
  stat,
  entered,
  size = "primary",
}: {
  stat: CaseStudy["stat"];
  entered: boolean;
  size?: "primary" | "secondary" | "banner";
}) {
  const fromValue = useCountUp(stat.rateFrom ?? 0, entered && stat.rateFrom != null);
  const toValue = useCountUp(stat.target, entered);

  const sizeMap = {
    primary: "clamp(72px, 9vw, 144px)",
    secondary: "clamp(56px, 6.5vw, 104px)",
    banner: "clamp(80px, 10vw, 160px)",
  } as const;
  const unitSizeMap = {
    primary: "clamp(13px, 1vw, 16px)",
    secondary: "clamp(12px, 0.9vw, 14px)",
    banner: "clamp(14px, 1.1vw, 18px)",
  } as const;

  return (
    <div className="flex flex-col items-start">
      <div
        className="flex items-baseline font-medium leading-[0.9] text-foreground"
        style={{
          fontSize: sizeMap[size],
          letterSpacing: "-0.05em",
        }}
      >
        {stat.rateFrom != null ? (
          <>
            <span className="tabular-nums">{fromValue}</span>
            <span
              aria-hidden
              className="mx-3 text-foreground/35"
              style={{ fontSize: "0.7em", letterSpacing: 0 }}
            >
              →
            </span>
            <span className="tabular-nums">{toValue}</span>
          </>
        ) : (
          <>
            {stat.prefix && (
              <span className="mr-[0.02em]">{stat.prefix}</span>
            )}
            <span className="tabular-nums">{toValue}</span>
            {stat.suffix && (
              <span
                style={{ fontSize: "0.55em", marginLeft: "0.06em" }}
                className="tabular-nums"
              >
                {stat.suffix}
              </span>
            )}
          </>
        )}
      </div>
      <p
        className="mt-4 text-foreground-mid"
        style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: unitSizeMap[size],
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        {stat.unit}
      </p>
    </div>
  );
}

/* Live pulse — green dot + mono caps label. Pulses on a 1.8s
   cycle (slow enough to read as ambient, fast enough to register
   as "now"). When `prefers-reduced-motion` is set the pulse
   freezes at full opacity but stays visible. */
function LivePulse({ status, accent }: { status: "Live" | "Archived"; accent: string }) {
  const isLive = status === "Live";
  const color = isLive ? "#00a656" : "#8a8a8a";
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className="relative inline-flex h-2 w-2"
      >
        {isLive && (
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
            style={{ background: color }}
          />
        )}
        <span
          className="relative inline-flex h-2 w-2 rounded-full"
          style={{ background: color }}
        />
      </span>
      <span
        className="text-[10px] font-medium uppercase tracking-[0.18em]"
        style={{
          fontFamily: "var(--font-mono), monospace",
          color: isLive ? "var(--color-foreground)" : "var(--color-foreground-mid)",
        }}
      >
        {status}
      </span>
      <span
        aria-hidden
        className="hidden h-px w-6 sm:block"
        style={{ background: accent, opacity: 0.4 }}
      />
    </div>
  );
}

function CaseCard({
  case: c,
  index,
  layout,
}: {
  case: CaseStudy;
  index: number;
  /* `primary` is the wide row-1 card (Skyline). `secondary` is
     the narrower tall card next to it (MedCollect). `banner` is
     the full-width row-2 card (Jijibai). Each variant shifts the
     stat hero size and the internal flex direction. */
  layout: "primary" | "secondary" | "banner";
}) {
  const { ref, entered } = useEnteredViewport<HTMLDivElement>();

  const isBanner = layout === "banner";

  return (
    <AnimateIn y={28} delay={index * 0.08}>
      <div ref={ref} className="h-full">
        <Link
          href={`/work/${c.slug}`}
          data-cursor-text="view it"
          className="group relative flex h-full flex-col overflow-hidden rounded-sm border border-foreground/12 bg-[var(--color-paper-cream,#fdfaf2)] p-8 transition-[border-color,box-shadow,transform] duration-500 ease-out hover:-translate-y-1 hover:border-foreground/30 hover:shadow-[0_28px_64px_-30px_rgba(75,40,255,0.22)] sm:p-10 lg:p-12"
          style={{ minHeight: isBanner ? "auto" : "100%" }}
        >
          {/* Accent radial bloom — bottom-right, tinted with case
              accent. Sits BEHIND content via z-0 + relative on
              the content wrapper. Reads as the stat "warming"
              the card. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(circle 480px at 85% 90%, ${c.accent}1f 0%, transparent 60%)`,
            }}
          />

          {/* ─── Top row: tagline · live pulse · chevron ─── */}
          <div className="relative z-[1] flex items-center justify-between gap-4">
            <span
              className="text-[11px] font-medium uppercase tracking-[0.18em] text-foreground-mid"
              style={{ fontFamily: "var(--font-mono), monospace" }}
            >
              {c.tagline}
            </span>
            <LivePulse status={c.status} accent={c.accent} />
          </div>

          {/* ─── Body row(s). Banner = horizontal split; others =
              vertical stack. */}
          <div
            className={`relative z-[1] mt-10 flex flex-1 gap-10 ${
              isBanner ? "flex-col lg:flex-row lg:items-end lg:gap-16" : "flex-col"
            }`}
          >
            {/* Stat hero — the visual */}
            <div className={isBanner ? "lg:flex-[1.2]" : ""}>
              <StatHero
                stat={c.stat}
                entered={entered}
                size={layout}
              />
            </div>

            {/* Text block */}
            <div className={isBanner ? "lg:flex-[1] lg:max-w-[40ch]" : "mt-2"}>
              <MaskReveal
                text={c.client}
                as="h3"
                className="font-medium leading-[1] text-foreground"
                style={{
                  fontSize:
                    layout === "banner"
                      ? "clamp(36px, 3.6vw, 56px)"
                      : layout === "primary"
                      ? "clamp(32px, 2.8vw, 44px)"
                      : "clamp(28px, 2.4vw, 38px)",
                  letterSpacing: "-0.04em",
                }}
                stagger={0.05}
                duration={0.7}
              />
              <p
                className="mt-5 max-w-[36ch] text-pretty text-foreground-mid"
                style={{
                  fontSize: "clamp(16px, 1.15vw, 19px)",
                  lineHeight: 1.45,
                  letterSpacing: "-0.01em",
                }}
              >
                {c.headline}
              </p>
              <p
                className="mt-4 italic text-foreground/75"
                style={{
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                  fontSize: "clamp(15px, 1.1vw, 18px)",
                }}
              >
                {c.outcome}
              </p>
            </div>
          </div>

          {/* ─── Footer row: services chips · chevron · accent
              grow-rule. */}
          <div className="relative z-[1] mt-8 flex items-end justify-between gap-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {c.services.map((service, sIdx) => (
                <span
                  key={service}
                  className="inline-flex items-center text-[10px] font-medium uppercase tracking-[0.14em] text-foreground-mid"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {service}
                  {sIdx < c.services.length - 1 && (
                    <span aria-hidden className="ml-3 text-foreground/30">
                      ·
                    </span>
                  )}
                </span>
              ))}
            </div>
            <ArrowUpRight
              aria-hidden
              size={22}
              className="shrink-0 text-foreground/55 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-foreground"
            />
          </div>

          {/* Accent rule — sits flush at the card's bottom edge,
              flush-left of the content padding so it reads as the
              underline UNDER the services chips. Grows 48 → 128px
              on hover. Negative margin compensates for the card's
              padding so the rule starts at the actual left edge,
              not at the content's left edge. */}
          <span
            aria-hidden
            className="absolute bottom-0 left-0 h-[3px] w-12 transition-[width] duration-500 group-hover:w-32"
            style={{ background: c.accent }}
          />
        </Link>
      </div>
    </AnimateIn>
  );
}

export default function AboutWorkStrip() {
  return (
    <section
      aria-labelledby="work-strip-heading"
      className="relative py-24 sm:py-32 lg:py-40"
      style={{ background: "#ffffff" }}
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <p className="editorial-label text-foreground-mid">
              <span className="tabular-nums">№ 03</span>
              <span aria-hidden className="h-px w-8 bg-foreground-mid/40" />
              <span>Work in production</span>
            </p>
            <MaskReveal
              text="Three sprints, three live products."
              as="h2"
              id="work-strip-heading"
              className="mt-8 max-w-[20ch] text-balance font-medium leading-[1] text-foreground"
              style={{
                fontSize: "clamp(36px, 4.8vw, 76px)",
                letterSpacing: "-0.045em",
              }}
            />
          </div>
          <Link
            href="/work"
            data-cursor-text="all work"
            className="inline-flex items-center gap-2 self-start text-base font-medium text-foreground hover:text-primary lg:col-span-5 lg:justify-end lg:text-lg"
            style={{ letterSpacing: "-0.02em" }}
          >
            See all case studies
            <ArrowUpRight aria-hidden size={18} />
          </Link>
        </div>

        {/* Velocity marquee — real client names cycling. Edge
            mask softens the leftmost ~80px and rightmost ~80px so
            words appear to drift into the strip from a soft fade
            rather than getting hard-clipped at the section
            margin. Mask is a horizontal linear gradient from
            transparent → opaque → transparent, applied via
            mask-image which is independent of the marquee's own
            transform animation. */}
        <div
          aria-hidden
          className="mt-12 -mx-6 sm:-mx-8 lg:-mx-14 xl:-mx-20 border-y border-foreground/10 py-5"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%)",
          }}
        >
          <ScrollBasedVelocity
            text="SKYLINE · MEDCOLLECT · JIJIBAI · "
            default_velocity={3}
            className="text-[clamp(28px,3.4vw,56px)] font-medium leading-none tracking-[-0.04em] text-foreground/65"
          />
        </div>

        {/* ─── Bento grid: 12-col asymmetric.
            lg+ layout:
              Row 1: Skyline (7) + MedCollect (5)
              Row 2: Jijibai (12, banner)
            md fallback: 2-up row 1, banner row 2 stays full-width.
            mobile: stacks 1-up. */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:gap-7 md:grid-cols-12">
          <div className="md:col-span-7">
            <CaseCard case={CASES[0]!} index={0} layout="primary" />
          </div>
          <div className="md:col-span-5">
            <CaseCard case={CASES[1]!} index={1} layout="secondary" />
          </div>
          <div className="md:col-span-12">
            <CaseCard case={CASES[2]!} index={2} layout="banner" />
          </div>
        </div>
      </div>
    </section>
  );
}
