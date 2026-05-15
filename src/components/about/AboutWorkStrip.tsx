"use client";

import { useEffect, useRef, useState } from "react";

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
  /* Two-signal stat hero instead of a single count-up number.
     We don't have client-approved performance metrics to publish
     (conversion %, time-savings, etc.), so the hero is anchored
     on facts that are 100% defensible from the codebase:
       • `primary`  — the loud number (e.g. "20" for module count)
       • `primaryLabel` — what that number IS (e.g. "modules")
       • `secondary`— the smaller secondary number (e.g. "2025")
       • `secondaryLabel` — what that number IS (e.g. "shipped")
     Both numbers animate via the same count-up easing — the
     secondary just renders smaller and to the side. The labels
     are mono-uppercase to read as instrument readouts rather
     than marketing copy. */
  readonly stat: {
    readonly primary: number;
    readonly primaryLabel: string;
    readonly secondary: number;
    readonly secondaryLabel: string;
  };
  readonly outcome: string;
  readonly services: readonly string[];
  readonly accent: string;
  readonly status: "Live" | "Archived";
}

const CASES: readonly CaseStudy[] = [
  {
    slug: "skyline",
    tagline: "Elevator Industry · 2025",
    client: "Skyline",
    headline:
      "Proposal-to-contract platform for an NYC elevator firm.",
    /* 12 = real top-level page modules under src/pages/
         (Admin, CreateDashboard, PaymentTable, Procument, auth,
          coming-soon, dashboard, directory, inspections,
          not-found, proposalDashboard, users). Counted from the
          actual repo, not inflated. */
    stat: {
      primary: 12,
      primaryLabel: "modules shipped",
      secondary: 2025,
      secondaryLabel: "live since",
    },
    outcome:
      "Gmail-integrated proposals, multi-elevator grouping, inspections, payment phases.",
    services: ["React", "Redux", "Radix", "Google Maps", "Gmail API"],
    accent: "#4b28ff",
    status: "Live",
  },
  {
    slug: "medcollect",
    tagline: "Healthcare · 2025",
    client: "MedCollect",
    headline:
      "Claims, ERA/EOB and patient management for a US billing team.",
    /* 20 = real backend modules under src/modules/ of
         med-collect-BACKEND (activity-logs, auth, billing-
         entities, claims, common, cpt-code-rates, cpt-codes, era,
         facilities, groups, manual-eob, patient-insurance,
         patients, payers, permissions, profile, providers,
         queue, roles, system, users). Defensible from `ls`. */
    stat: {
      primary: 20,
      primaryLabel: "backend modules",
      secondary: 2025,
      secondaryLabel: "live since",
    },
    outcome:
      "Cookie-session RBAC, field-level encryption, single-session auth.",
    services: ["React", "TanStack Query", "Hapi", "MongoDB", "AWS S3"],
    accent: "#fc5038",
    status: "Live",
  },
  {
    slug: "jijibai",
    tagline: "Inventory & Billing · 2025",
    client: "Jijibai",
    headline:
      "Vendor dashboard for inventory, billing, returns and refunds.",
    /* 13 = real backend controllers under
         jijibai-dashboard/server/src/controllers (auth, backup,
         bills, customers, dashboard, errorlog, expenses,
         products, returns, settings, trash, upload, users). */
    stat: {
      primary: 13,
      primaryLabel: "controllers built",
      secondary: 2025,
      secondaryLabel: "live since",
    },
    outcome:
      "Barcode + QR, PDF invoicing, Cloudinary storage, audit logs, soft-delete trash.",
    services: ["React 19", "Express", "MongoDB", "Cloudinary", "JWT"],
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
      /* Fallback: if IntersectionObserver isn't available, assume
         entered so the count-up animation isn't permanently stuck
         at 0. Intentional inverse of the normal observer flow. */
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
  const primaryValue = useCountUp(stat.primary, entered);
  /* Year doesn't count up — a 0 → 2025 roll reads as a phone
     number. Render the year statically once the card has entered
     the viewport (entered === true means the rest of the card
     has already animated in, so a static year doesn't feel
     dead against an animating primary). */
  const secondaryValue = entered ? stat.secondary : 0;

  const primarySizeMap = {
    primary: "clamp(72px, 9vw, 144px)",
    secondary: "clamp(56px, 6.5vw, 104px)",
    banner: "clamp(80px, 10vw, 160px)",
  } as const;
  const secondarySizeMap = {
    primary: "clamp(22px, 2vw, 32px)",
    secondary: "clamp(20px, 1.8vw, 28px)",
    banner: "clamp(26px, 2.4vw, 38px)",
  } as const;
  const labelSizeMap = {
    primary: "clamp(11px, 0.9vw, 13px)",
    secondary: "clamp(10px, 0.85vw, 12px)",
    banner: "clamp(12px, 1vw, 14px)",
  } as const;

  return (
    <div className="flex flex-col items-start">
      {/* Primary number — the loud "modules shipped" / "controllers
          built" count. Anchors the card. */}
      <div
        className="flex items-baseline font-medium leading-[0.9] text-foreground"
        style={{
          fontSize: primarySizeMap[size],
          letterSpacing: "-0.05em",
        }}
      >
        <span className="tabular-nums">{primaryValue}</span>
      </div>
      <p
        className="mt-4 text-foreground-mid"
        style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: labelSizeMap[size],
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        {stat.primaryLabel}
      </p>
      {/* Secondary number — the launch year, rendered smaller and
          separated by a hairline rule so it reads as a sub-stat,
          not a competing value. The two-signal layout replaces the
          single count-up percentage we used to invent. */}
      <div
        aria-hidden
        className="mt-6 h-px w-12 bg-foreground/15"
      />
      <div
        className="mt-4 flex items-baseline gap-3 text-foreground/85"
        style={{
          fontSize: secondarySizeMap[size],
          letterSpacing: "-0.03em",
          fontWeight: 500,
        }}
      >
        <span className="tabular-nums">{secondaryValue}</span>
        <span
          className="text-foreground-mid"
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: labelSizeMap[size],
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {stat.secondaryLabel}
        </span>
      </div>
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
        {/* Static (non-clickable) case card — /work/<slug> detail
            pages aren't shipping in this launch scope, so we render
            the card as a passive editorial tile rather than a link.
            Hover lift/shadow + chevron icon were removed because
            both signalled "click me" to a destination that doesn't
            exist yet. The accent bloom, live pulse, and grow-rule
            stay — those are passive visual flair, not interaction
            affordances. Wrap this back in <Link> + restore the
            chevron/hover treatment when /work/[slug] ships. */}
        <div
          className="relative flex h-full flex-col overflow-hidden rounded-sm border border-foreground/12 bg-[var(--color-paper-cream,#fdfaf2)] p-8 sm:p-10 lg:p-12"
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
          </div>

          {/* Accent rule — sits flush at the card's bottom edge,
              flush-left of the content padding so it reads as the
              underline UNDER the services chips. Fixed-width now
              that the card is non-clickable — there's no hover
              state to grow on. Restore the 48 → 128px transition
              when the card is re-linked. */}
          <span
            aria-hidden
            className="absolute bottom-0 left-0 h-[3px] w-12"
            style={{ background: c.accent }}
          />
        </div>
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
          {/* "See all case studies" link was here, pointing to
              /work. Hidden for this launch — the /work archive
              page hasn't shipped, so the link would dead-end on a
              404. Restore once /work is live. The col-span gap
              on the right of the header (col-span-5) is now
              empty whitespace, which reads as breathing room
              rather than a missing affordance. */}
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
