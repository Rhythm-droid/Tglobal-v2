"use client";

import { useRef } from "react";
import { usePinnedHorizontalScroll } from "@/components/primitives/usePinnedHorizontalScroll";

/**
 * Section 5 — "Quickly Build Impactful Softwares."
 * ────────────────────────────────────────────────────────────
 *
 *    ┌──────────────────────────────────────────────────────┐
 *    │ HOW TO EDIT THIS SECTION                             │
 *    │                                                      │
 *    │ • Heading + description text                         │
 *    │     → COPY block below                               │
 *    │ • Step copy + accent colour                          │
 *    │     → STEPS block below (one entry per card)         │
 *    │ • Card frame, illustration sizing, pill colours      │
 *    │     → TUNING block below                             │
 *    └──────────────────────────────────────────────────────┘
 *
 * Figma (1440 × 792 frame, node 211-5641):
 *   Section          1440 × 792, white background
 *   Header           x=80, y=80, w=1280, h=136 — heading left, description right
 *   Cards container  x=80, y=248, w=1280, h=464, clip content, count: 6
 *   Each card        ≈308 × 464, rx 24, white, soft drop-shadow
 *   Pills            below cards, centred ~y=720
 *
 * Behaviour mirrors HowItWorks exactly:
 *   ≥lg: GSAP pinned horizontal scroll, scrub:true (Lenis owns smoothing)
 *   <lg: Native overflow-x scroll-snap
 *   Pills are 1:1 with cards, clickable, drive lenis.scrollTo on desktop
 *
 * Why this isn't a generic <HorizontalCarousel /> shared with HowItWorks:
 *   The two sections look identical at the GSAP layer but their layouts
 *   differ — HowItWorks has the header LEFT, this one has it ABOVE. The
 *   wrapper geometry, header position, pills position all differ.
 *   Abstracting now would lock in the wrong shape; a shared primitive can
 *   be extracted later when a third instance shows the real common surface.
 * ────────────────────────────────────────────────────────────
 */

/* ─── COPY ─────────────────────────────────────────────────── */
const COPY = {
  /** Heading is 2 explicit lines per Figma — manual breaks keep the wrap
   *  exact at every viewport instead of relying on character-width guesses. */
  heading: ["Quickly Build", "Impactful Softwares."],
  description:
    "This is Agile development driven by AI agents augmenting elite engineers to develop at super-fast speeds. Strategy no longer waits for execution — it becomes execution.",
} as const;

/* ─── STEPS ────────────────────────────────────────────────── */
/**
 * 6 cards per Figma's `count: 6` on the cards container. `accent` is a
 * single rgba string the card's illustration uses as the centre of its
 * radial gradient — fades to transparent so the wash blends into the
 * white card with no hard rectangular edge.
 */
const STEPS = [
  {
    n: "Step 1",
    title: "Product Discovery",
    description:
      "We turn rough ideas into a clear build path by reviewing workflows, goals, dependencies, and the fastest route to a shippable MVP.",
    footerLead: "Discovery Completed within",
    footerHours: "24 hours",
    footerTrail: "of contact.",
    accent: "rgba(248, 158, 158, 0.55)", // coral
    accentSolid: "#E26A78",
  },
  {
    n: "Step 2",
    title: "Demo Prototype",
    description:
      "A clickable demo lands in your inbox so you feel the product before a single sprint starts. Direction confirmed before scope is committed.",
    footerLead: "Demo of the product is sent in",
    footerHours: "36 hours",
    footerTrail: "",
    accent: "rgba(168, 198, 248, 0.55)", // sky
    accentSolid: "#4B7DD0",
  },
  {
    n: "Step 3",
    title: "PRD Creation",
    description:
      "We translate product vision into a scoped PRD, prioritised release plan, and the exact decisions the build team needs next.",
    footerLead: "PRD shared and reviewed in",
    footerHours: "48 hours",
    footerTrail: "",
    accent: "rgba(196, 178, 255, 0.55)", // lavender
    accentSolid: "#7A5CF0",
  },
  {
    n: "Step 4",
    title: "Task Creation",
    description:
      "Granular tickets, owner mapping, and acceptance criteria — every task ready for engineering to pick up and run.",
    footerLead: "Backlog cut and assigned within",
    footerHours: "24 hours",
    footerTrail: "",
    accent: "rgba(168, 230, 196, 0.55)", // mint
    accentSolid: "#3FA56F",
  },
  {
    n: "Step 5",
    title: "AI-Assisted Engineering",
    description:
      "Our engineers ship in tandem with AI accelerators — full features moving from blank repo to staging in days, not months.",
    footerLead: "First feature live within",
    footerHours: "5 days",
    footerTrail: "",
    accent: "rgba(255, 200, 138, 0.55)", // amber
    accentSolid: "#D8893E",
  },
  {
    n: "Step 6",
    title: "QA & Launch",
    description:
      "Automated and manual QA in lockstep with development. Every release is regression-tested across devices before it ships.",
    footerLead: "Coverage report delivered within",
    footerHours: "12 hours",
    footerTrail: "of cut.",
    accent: "rgba(228, 184, 240, 0.55)", // lilac
    accentSolid: "#A75AC4",
  },
] as const;

/* ─── SCROLL FEEL ──────────────────────────────────────────── */
/**
 * Fraction of the pinned scroll range that's a "settle" beat — the section
 * stays locked centre-of-viewport while the user feels the pin engage,
 * before any card translation begins. Mirrors HowItWorks so both pinned
 * sections handshake the same way visually. 0.20 = 20% of pin scroll.
 * Used by both the pin timeline and the pill-click progress remap.
 */
const SETTLE_RATIO = 0.2;

/* ─── TUNING ───────────────────────────────────────────────── */
const TUNING = {
  background: "#ffffff",
  pad: {
    sideMobile: "1.5rem", // 24
    sideTablet: "2.5rem", // 40
    yMobile: "4rem", // 64
  },
  card: {
    /** Figma: 308 × 464, rx 24. `min(82vw, 308px)` lets a single card hug
     *  most of the viewport on phones while staying capped at the Figma
     *  pixel on desktop (where 82vw is way past 308). */
    width: "min(82vw, 308px)",
    minHeight: 464,
    radius: 24,
    padding: 24,
    border: "#f0f1f4",
    /** Same soft purple-tinted drop shadow we use in HowItWorks — 4 stacked
     *  blurs collapsed to a CSS shadow stack. Keeps the visual language
     *  consistent across the two sections. */
    shadow:
      "0px 14px 31px rgba(240,216,251,0.10), 0px 57px 57px rgba(240,216,251,0.09), 0px 129px 77px rgba(240,216,251,0.05), 0px 229px 92px rgba(240,216,251,0.01)",
  },
  cardGap: 16,
  pill: {
    width: 20,
    height: 7,
    gap: 4,
    activeColor: "#4B28FF",
    inactiveColor: "#EAECF0",
    /** One pill per card. */
  },
  /**
   * Desktop (≥lg) layout — absolute positions taken from the 1440 × 792
   * Figma frame and converted to clamp(min, vw_at_1440, max) for the
   * horizontal axis. Vertical positions use frame pixels directly because
   * the inner frame's height is fixed at 792.
   *
   *   Figma                          clamp expression
   *   ──────────────────────────     ────────────────────────────
   *   padX     x = 80                left/right: clamp(40, 5.56vw, 80)
   *   header   y = 80, h = 136       top: 80
   *   cards    y = 248, h = 464      top: 248
   *   pills    y = 720               top: 720
   *
   * Section is centred vertically in the pinned viewport, so when the
   * page is taller than 792 the whole composition floats in the middle.
   */
  desktop: {
    containerMaxWidth: 1440,
    sectionHeight: 792,
    padX: "clamp(40px, 5.56vw, 80px)",
    headerTop: 80,
    headerHeight: 136,
    cardsTop: 248,
    cardsHeight: 464,
    pillsTop: 720,
    /** 48px gap between heading column and description column on desktop
     *  (Figma "Frame 2147227694" auto-layout). */
    headerColumnGap: "48px",
  },
  type: {
    // Heading: Albert Sans Medium 64 / 0.92, -6% tracking — matches HowItWorks.
    heading: {
      size: "clamp(36px, 4.44vw, 64px)",
      lineHeight: "0.92",
      tracking: "-0.06em",
      color: "#010101",
    },
    description: {
      size: "clamp(16px, 1.25vw, 18px)",
      lineHeight: "1.45",
      tracking: "-0.02em",
      color: "#404040",
    },
    stepLabel: {
      size: "12px",
      lineHeight: "1.2",
      tracking: "0",
      color: "#909090",
    },
    cardTitle: {
      size: "20px",
      lineHeight: "1.2",
      tracking: "-0.04em",
      color: "#010101",
    },
    cardBody: {
      size: "13px",
      lineHeight: "1.55",
      tracking: "-0.02em",
      color: "#5f5f5f",
    },
    cardFooter: {
      size: "12px",
      lineHeight: "1.4",
      tracking: "0",
      color: "#7a7a7a",
    },
  },
} as const;

/* ─── ILLUSTRATION ─────────────────────────────────────────── */
type Step = (typeof STEPS)[number];

/**
 * Per-step decorative illustration — a soft radial wash of the step's
 * accent colour fading to transparent at the edges, with a small stack
 * of abstract shapes on top. The radial gradient is what gives us the
 * "blend into white card" feel; no hard rectangle, no F7F7F7 box.
 *
 * Shapes are intentionally minimal and unrelated to the step copy — the
 * illustration is decoration, not a literal icon. When the user has Figma
 * exports for these (like the HowItWorks SVGs), drop them into
 * /public/services/ and replace the inline `<svg>` with an `<img>`.
 */
function CardIllustration({ step }: { readonly step: Step }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none relative w-full overflow-hidden"
      style={{
        flex: "1 1 auto",
        background: `radial-gradient(ellipse 80% 70% at 50% 55%, ${step.accent} 0%, rgba(255,255,255,0) 78%)`,
      }}
    >
      <svg
        viewBox="0 0 260 200"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
      >
        {/* Soft inner glow ring */}
        <circle
          cx="130"
          cy="100"
          r="48"
          fill={step.accentSolid}
          fillOpacity="0.10"
        />
        {/* Centred abstract chip */}
        <rect
          x="98"
          y="76"
          width="64"
          height="48"
          rx="10"
          fill="#ffffff"
          stroke={step.accentSolid}
          strokeOpacity="0.35"
          strokeWidth="1"
        />
        <circle cx="113" cy="100" r="5" fill={step.accentSolid} fillOpacity="0.55" />
        <rect
          x="123"
          y="96"
          width="28"
          height="3"
          rx="1.5"
          fill={step.accentSolid}
          fillOpacity="0.35"
        />
        <rect
          x="123"
          y="103"
          width="20"
          height="3"
          rx="1.5"
          fill={step.accentSolid}
          fillOpacity="0.20"
        />
        {/* Floating accent dots */}
        <circle cx="64" cy="58" r="4" fill={step.accentSolid} fillOpacity="0.5" />
        <circle cx="200" cy="48" r="3" fill={step.accentSolid} fillOpacity="0.4" />
        <circle cx="210" cy="148" r="5" fill={step.accentSolid} fillOpacity="0.35" />
        <circle cx="58" cy="150" r="3.5" fill={step.accentSolid} fillOpacity="0.3" />
      </svg>
    </div>
  );
}

/* ─── CARD ─────────────────────────────────────────────────── */
function StepCard({ step }: { readonly step: Step }) {
  return (
    <article
      data-step-card
      className="relative flex shrink-0 snap-start flex-col bg-white"
      style={{
        width: TUNING.card.width,
        minHeight: TUNING.card.minHeight,
        borderRadius: TUNING.card.radius,
        padding: TUNING.card.padding,
        border: `1px solid ${TUNING.card.border}`,
        boxShadow: TUNING.card.shadow,
      }}
    >
      {/* Top text block — Step label, title, description */}
      <div className="flex flex-col gap-2">
        <p
          className="m-0 font-medium uppercase tracking-wide"
          style={{
            fontSize: TUNING.type.stepLabel.size,
            lineHeight: TUNING.type.stepLabel.lineHeight,
            letterSpacing: "0.04em",
            color: TUNING.type.stepLabel.color,
          }}
        >
          {step.n}
        </p>
        <h3
          className="m-0 font-semibold"
          style={{
            fontSize: TUNING.type.cardTitle.size,
            lineHeight: TUNING.type.cardTitle.lineHeight,
            letterSpacing: TUNING.type.cardTitle.tracking,
            color: TUNING.type.cardTitle.color,
          }}
        >
          {step.title}
        </h3>
        <p
          className="m-0 font-normal"
          style={{
            fontSize: TUNING.type.cardBody.size,
            lineHeight: TUNING.type.cardBody.lineHeight,
            letterSpacing: TUNING.type.cardBody.tracking,
            color: TUNING.type.cardBody.color,
          }}
        >
          {step.description}
        </p>
      </div>

      {/* Illustration — fills the middle of the card and blends into the
          white surround via its radial-gradient background. */}
      <div className="my-5 flex-1">
        <CardIllustration step={step} />
      </div>

      {/* Footer — "<lead> <hours bold> <trail>" */}
      <p
        className="m-0"
        style={{
          fontSize: TUNING.type.cardFooter.size,
          lineHeight: TUNING.type.cardFooter.lineHeight,
          color: TUNING.type.cardFooter.color,
        }}
      >
        {step.footerLead}{" "}
        <span className="font-semibold" style={{ color: "#010101" }}>
          {step.footerHours}
        </span>
        {step.footerTrail ? ` ${step.footerTrail}` : ""}
      </p>
    </article>
  );
}

/* ─── PILLS ────────────────────────────────────────────────── */
function ScrollPills({
  active,
  onSelect,
}: {
  readonly active: number;
  readonly onSelect: (index: number) => void;
}) {
  return (
    <div
      role="tablist"
      className="flex items-center"
      style={{ gap: TUNING.pill.gap }}
    >
      {STEPS.map((step, i) => {
        const isActive = i === active;
        return (
          <button
            key={step.title}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Go to step ${i + 1}: ${step.title}`}
            onClick={() => onSelect(i)}
            className="block cursor-pointer rounded-full border-0 p-0 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4B28FF]"
            style={{
              width: TUNING.pill.width,
              height: TUNING.pill.height,
              background: isActive
                ? TUNING.pill.activeColor
                : TUNING.pill.inactiveColor,
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── HEADER ───────────────────────────────────────────────── */
/**
 * Two-column header — heading on the left, description on the right.
 * Below lg the columns stack and gap collapses to a single rem so the
 * mobile treatment matches the rest of the page.
 */
function Header() {
  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
      <h2
        id="services-heading"
        className="m-0 font-medium"
        style={{
          fontSize: TUNING.type.heading.size,
          lineHeight: TUNING.type.heading.lineHeight,
          letterSpacing: TUNING.type.heading.tracking,
          color: TUNING.type.heading.color,
          maxWidth: "640px",
        }}
      >
        {COPY.heading.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h2>
      <p
        className="m-0"
        style={{
          fontSize: TUNING.type.description.size,
          lineHeight: TUNING.type.description.lineHeight,
          letterSpacing: TUNING.type.description.tracking,
          color: TUNING.type.description.color,
          maxWidth: "440px",
        }}
      >
        {COPY.description}
      </p>
    </header>
  );
}

/* ─── SECTION ─────────────────────────────────────────────── */
export default function Services() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const mobileTrackRef = useRef<HTMLDivElement | null>(null);
  const { active, onPillSelect } = usePinnedHorizontalScroll({
    sectionRef,
    viewportRef,
    trackRef,
    mobileTrackRef,
    stepCount: STEPS.length,
    settleRatio: SETTLE_RATIO,
    refreshPriority: 1,
  });

  return (
    <section
      id="services"
      ref={sectionRef}
      aria-labelledby="services-heading"
      className="relative w-full"
      style={{ background: TUNING.background }}
    >
      {/* ─── Mobile/tablet (<lg): stacked, native horizontal scroll ─────── */}
      <div
        className="flex flex-col gap-10 px-[var(--svc-side-mobile)] py-[var(--svc-y-mobile)] sm:px-[var(--svc-side-tablet)] lg:hidden"
        style={
          {
            ["--svc-side-mobile" as string]: TUNING.pad.sideMobile,
            ["--svc-side-tablet" as string]: TUNING.pad.sideTablet,
            ["--svc-y-mobile" as string]: TUNING.pad.yMobile,
          } as React.CSSProperties
        }
      >
        <Header />

        {/* Cards strip — overflow-x with snap, scrollbar hidden */}
        <div
          ref={mobileTrackRef}
          className="-mx-[var(--svc-side-mobile)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--svc-side-mobile)] pb-2 sm:-mx-[var(--svc-side-tablet)] sm:px-[var(--svc-side-tablet)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {STEPS.map((step) => (
            <StepCard key={step.title} step={step} />
          ))}
        </div>

        <nav aria-label="Carousel progress" className="flex justify-center">
          <ScrollPills active={active} onSelect={onPillSelect} />
        </nav>
      </div>

      {/* ─── Desktop (≥lg): pinned scroll, Figma-exact absolute positions ─

          `bg-white` on this pinned element (not just the parent section) is
          load-bearing: ScrollTrigger pins this with `pinType: "fixed"`, so
          during pin the element is taken out of flow and floats over the
          document. Without an opaque background the next/prev section
          scrolls visibly underneath the pinned rectangle and you get two
          sections layered (HowItWorks heading bleeding through Services
          heading, etc.). Painting opaque closes that window — see the same
          comment in HowItWorks.tsx for the longer rationale. */}
      <div
        ref={viewportRef}
        className="relative hidden h-screen w-full overflow-hidden bg-white lg:block"
      >
        <div className="absolute inset-0 flex items-center">
          <div
            className="relative mx-auto w-full"
            style={{
              maxWidth: TUNING.desktop.containerMaxWidth,
              height: TUNING.desktop.sectionHeight,
            }}
          >
            {/* Header — Figma x=80, y=80, w=1280. The wrapper extends
                between left/right padX so it widens to the inner frame
                content area; columns inside are flex with header gap. */}
            <div
              className="absolute"
              style={{
                left: TUNING.desktop.padX,
                right: TUNING.desktop.padX,
                top: TUNING.desktop.headerTop,
                height: TUNING.desktop.headerHeight,
              }}
            >
              <Header />
            </div>

            {/* Cards-area — Figma x=80, y=248, w=1280, h=464. Same overflow:
                hidden trick we use in HowItWorks: clip the track so cards
                never bleed outside this band as GSAP translates them. */}
            <div
              className="absolute flex items-center overflow-hidden"
              style={{
                left: TUNING.desktop.padX,
                right: TUNING.desktop.padX,
                top: TUNING.desktop.cardsTop,
                height: TUNING.desktop.cardsHeight,
              }}
            >
              <div
                ref={trackRef}
                className="flex h-full items-stretch will-change-transform"
                style={{ gap: TUNING.cardGap }}
              >
                {STEPS.map((step) => (
                  <StepCard key={step.title} step={step} />
                ))}
              </div>
            </div>

            {/* Pills — Figma y≈720, centred horizontally. Anchored to the
                inner frame, not the viewport, so the pills row stays
                aligned with the cards band at any viewport size. */}
            <nav
              aria-label="Carousel progress"
              className="absolute"
              style={{
                left: "50%",
                transform: "translateX(-50%)",
                top: TUNING.desktop.pillsTop,
              }}
            >
              <ScrollPills active={active} onSelect={onPillSelect} />
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
