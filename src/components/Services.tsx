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
 *   Each card        400 × 464, rx 8, white, soft drop-shadow
 *   Text container   x=24, y=24, w=352, h=122 hug (step label + title + body)
 *   Illustration     x=43, y=142, 315 × 315 SVG centred horizontally
 *                    (Group 2147225016). Bottom of the SVG fades to
 *                    transparent so the footer can read through it.
 *   Card footer      x=24, y=422, w=352, h=18, Albert Sans 14 / 130%
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
    "This is Agile development driven by AI agents augmenting elite engineers to develop at super-fast speeds. Strategy no longer waits for execution. It becomes execution.",
} as const;

/* ─── STEPS ────────────────────────────────────────────────── */
/**
 * 7 cards (Figma's cards container — Step 7 added late). `accent` is a
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
    /** Static SVG export from Figma (315 × 315, node 211-4905). When
     *  present the card swaps the inline placeholder for this asset. */
    illust: "/services/illust-1.svg",
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
    illust: "/services/illust-2.svg",
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
    illust: "/services/illust-3.svg",
  },
  {
    n: "Step 4",
    title: "Task Creation",
    description:
      "Granular tickets, owner mapping, and acceptance criteria. Every task ready for engineering to pick up and run.",
    footerLead: "Backlog cut and assigned within",
    footerHours: "24 hours",
    footerTrail: "",
    accent: "rgba(168, 230, 196, 0.55)", // mint
    accentSolid: "#3FA56F",
    illust: "/services/illust-4.svg",
  },
  {
    n: "Step 5",
    title: "AI-Assisted Engineering",
    description:
      "Our engineers ship in tandem with AI accelerators. Full features moving from blank repo to staging in days, not months.",
    footerLead: "First feature live within",
    footerHours: "5 days",
    footerTrail: "",
    accent: "rgba(255, 200, 138, 0.55)", // amber
    accentSolid: "#D8893E",
    illust: "/services/illust-5.svg",
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
    illust: "/services/illust-6.svg",
  },
  {
    n: "Step 7",
    title: "DevOps & Scale",
    description:
      "Infrastructure, CI/CD, monitoring, and release operations are set up early so the full product can keep scaling after the MVP launches.",
    footerLead: "Production handover within",
    footerHours: "7 days",
    footerTrail: "of launch.",
    accent: "rgba(166, 220, 226, 0.55)", // teal
    accentSolid: "#2A9097",
    illust: "/services/illust-7.svg",
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
    /** Figma: 400 × 464, rx 8 (Frame 2147227679). `min(85vw, 400px)`
     *  lets a single card hug most of the viewport on phones while
     *  staying capped at the Figma pixel on desktop (where 85vw is way
     *  past 400). */
    width: "min(85vw, 400px)",
    minHeight: 464,
    radius: 8,
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
      /** Figma: Albert Sans Regular 14 / 130% / 0% tracking, 18.2px tall.
       *  Wraps to 3 lines in the 352px content column → 54px hug height,
       *  matching the Figma frame's text container. */
      size: "14px",
      lineHeight: "1.3",
      tracking: "0",
      /** Figma fill: #2F2B43 at 70% opacity. */
      color: "rgba(47, 43, 67, 0.7)",
    },
    cardFooter: {
      /** Figma: Albert Sans Mixed 14 / 130% / 0% tracking, 18px tall. */
      size: "14px",
      lineHeight: "1.3",
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
  // Figma export — 315 × 315 SVG centred horizontally inside the 352px
  // content column (400 card − 2×24 padding). All 7 steps currently ship
  // an illust asset; the `'illust' in step` narrowing keeps the inline
  // placeholder reachable for any future step that lacks one.
  const illust = "illust" in step ? step.illust : undefined;
  if (illust) {
    return (
      <img
        src={illust}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="pointer-events-none mx-auto block w-full"
        style={{ maxWidth: 315, aspectRatio: "1 / 1", flex: "0 0 auto" }}
      />
    );
  }
  return (
    <div
      aria-hidden
      className="pointer-events-none relative mx-auto block w-full overflow-hidden"
      style={{
        maxWidth: 315,
        aspectRatio: "1 / 1",
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
      className="relative flex shrink-0 snap-start flex-col overflow-hidden bg-white"
      style={{
        width: TUNING.card.width,
        minHeight: TUNING.card.minHeight,
        borderRadius: TUNING.card.radius,
        padding: TUNING.card.padding,
        border: `1px solid ${TUNING.card.border}`,
        boxShadow: TUNING.card.shadow,
      }}
    >
      {/* Top text block — Step label, title, description.
          z-30 so it stays sharp on the card-footer-top feather. */}
      <div className="relative z-30 flex flex-col gap-2">
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

      {/* Illustration — Figma puts the 315 × 315 group at y=142 in the
          464 card (so it starts ~4px before the text block ends and runs
          past the footer at y=422). The SVG has a gradient mask that
          fades the bottom to transparent, so the footer text reads
          through cleanly. We mirror that by anchoring the footer
          absolutely at the card bottom and letting this block sit in
          normal flow above it with permission to overlap. z-10 keeps it
          underneath the card-footer feather overlays. */}
      <div className="relative z-10 mt-2 flex flex-1 items-start justify-center">
        <CardIllustration step={step} />
      </div>

      {/* Card-footer feather — Figma "Card Footer" (top): a vertical
          gradient that opaque-#F8F8F8s the upper ~100px of the card
          and feathers transparent over the next ~80px, sitting above
          the illustration so the illustration's top edge dissolves
          softly into the title block. Bleeds full-width with
          preserveAspectRatio="none" (the underlying SVG is 400×183,
          letting it stretch across the card's actual rendered width). */}
      <img
        src="/services/card-footer-top.svg"
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute left-0 right-0 top-0 z-20 w-full"
      />
      {/* Card-footer feather (bottom): mirror of the top — transparent
          fading into opaque #F8F8F8 over the bottom ~95px. Anchors the
          footer text on a soft tint that also masks the illustration's
          lower bleed. */}
      <img
        src="/services/card-footer-bottom.svg"
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 w-full"
      />

      {/* Footer — pinned to the card bottom with a 24px gutter (Figma
          x=24, y=422, w=352, h=18) so the illustration above can reach
          the lower edge without pushing this text out of view. z-30 to
          sit on top of the bottom feather. */}
      <p
        className="absolute bottom-6 left-6 right-6 z-30 m-0"
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
      // gap-2 on mobile (8px — meets touch-spacing min) → gap-1 (4px, Figma) on sm+.
      // Same trade-off as HowItWorks: phones need ≥8px between pills to avoid
      // adjacent-tap mistakes; tablet/desktop honor the tighter Figma spec.
      className="flex items-center gap-2 sm:gap-1"
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
  /* Wrapper around the pinned viewport. The hook sizes its height to the
     pin's scroll range minus the cross-fade tail, so Capabilities (the
     next section) lands at viewport top exactly when the cross-fade
     starts dissolving Services. Without this, with the new 400-px-wide
     cards the pin's scroll range exceeds the viewport's natural 100vh
     extent and Capabilities scrolls fully past behind the fixed pin. */
  const pinSpacerRef = useRef<HTMLDivElement | null>(null);
  const { active, onPillSelect } = usePinnedHorizontalScroll({
    sectionRef,
    viewportRef,
    trackRef,
    mobileTrackRef,
    pinSpacerRef,
    stepCount: STEPS.length,
    settleRatio: SETTLE_RATIO,
    /* Later-in-DOM pinned section. Must refresh AFTER HowItWorks so that
       its `start: "top top"` is computed against a document that already
       has HowItWorks's pin-spacer inserted. Lower number = later refresh.
       See the option's JSDoc in usePinnedHorizontalScroll for the rationale. */
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
          comment in HowItWorks.tsx for the longer rationale.

          The outer `pinSpacerRef` wrapper is sized by the GSAP hook to
          absorb the pin's scroll distance (≈ pin_range × 0.85) so that
          Capabilities (the next section) lands at viewport-top exactly
          when the cross-fade begins. Without it, with 400px cards the
          pin range (~1846px) exceeds the viewport's natural 100vh
          extent and Capabilities scrolls fully past behind the fixed
          pin — the user never sees the handover. The wrapper has no
          visible content; it just reserves document space. */}
      <div ref={pinSpacerRef} className="hidden w-full lg:block">
      <div
        ref={viewportRef}
        className="relative h-screen w-full overflow-hidden bg-white"
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
                never bleed outside this band as GSAP translates them.

                Bilateral soft fade mask (matches HowItWorks): the hard
                vertical clip at each padX edge looks abrupt as cards
                translate past, so we layer a `mask-image` with alpha
                gradients on both sides. Cards entering or leaving the
                visible band dissolve smoothly instead of snapping at
                the clip line. Stops at 6% and 94% give a band of
                roughly the same visible width as the HowItWorks fade,
                keeping the two pinned sections visually consistent. */}
            <div
              className="absolute flex items-center overflow-hidden"
              style={{
                left: TUNING.desktop.padX,
                right: TUNING.desktop.padX,
                top: TUNING.desktop.cardsTop,
                height: TUNING.desktop.cardsHeight,
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
                maskImage:
                  "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
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
      </div>
    </section>
  );
}
