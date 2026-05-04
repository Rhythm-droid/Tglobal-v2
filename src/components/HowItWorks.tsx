"use client";

import { useRef } from "react";
import { usePinnedHorizontalScroll } from "@/components/primitives/usePinnedHorizontalScroll";

/**
 * Section 4 — "How TGlobal Works" / "From Idea to Production — Instantly"
 * ────────────────────────────────────────────────────────────
 *
 *    ┌──────────────────────────────────────────────────────┐
 *    │ HOW TO EDIT THIS SECTION                             │
 *    │                                                      │
 *    │ • Copy (eyebrow, heading, description)               │
 *    │     → COPY block below                               │
 *    │ • Step content (title, body, illustration src)       │
 *    │     → STEPS block below                              │
 *    │ • Card frame, illustration sizing, pill colours      │
 *    │     → TUNING block below                             │
 *    └──────────────────────────────────────────────────────┘
 *
 * Figma (1440 frame, works.svg + card-N-full.svg + scroll-pills.svg):
 *   Section          1440 × 800, white background
 *   Card             420 × 509, rx 32, border #F5F6F8, soft drop-shadow
 *   Card padding     20 (rx 16 inner illustration frame, fill #F7F7F7)
 *   Illustration     380 × 376 lazy-loaded SVG (per-card vector exports
 *                    cropped from card-N-full.svg via extract-illust.ps1)
 *   Card title       Albert Sans Medium 24/24 -6% tracking, #010101
 *   Card body        Albert Sans Regular 14/1.5 -6% tracking, #909090
 *   Pills            20 × 7 each, 4 total, 4px gap; active #4B28FF, rest #EAECF0
 *
 * Behavior:
 *   ≥lg: GSAP pinned horizontal scroll. Section pins to viewport, the cards
 *        track translates right→left as the user scrolls vertically. Pill
 *        index advances with progress (0..3 across 4 pills).
 *   <lg: Native overflow-x scroll-snap. Mobile pill tracking is wired to a
 *        scroll listener on the track (not GSAP) so we don't ship the pin
 *        machinery to phones.
 *
 * Reduced motion:
 *   matchMedia gates the pinned scroll to (prefers-reduced-motion: no-preference).
 *   When reduced motion is requested, the cards just sit in their default
 *   position — no horizontal travel, no pin.
 *
 * Performance:
 *   Illustrations are static `/public/how-it-works/illust-N.svg` files served
 *   as cacheable assets and lazy-loaded by the browser. GSAP + ScrollTrigger
 *   are the only client deps; matchMedia ensures the pin code path never runs
 *   on phones, where it has no payoff.
 * ────────────────────────────────────────────────────────────
 */

/* ─── COPY ─────────────────────────────────────────────────── */
const COPY = {
  eyebrow: "How TGlobal Works",
  /** Heading is 3 explicit lines per Figma — manual breaks keep the wrap
   *  exact at every viewport instead of relying on character-width guesses. */
  heading: ["From Idea to", "Production,", "Instantly"],
  description:
    "We utilise AI models and combine them with your ideas to build scalable products.",
} as const;

/* ─── STEPS ────────────────────────────────────────────────── */
const STEPS = [
  {
    title: "Define Your Idea",
    description:
      "Start with intent, not complexity. Describe what you want to build (from features to workflows) and Tglobal translates it into a structured product blueprint.",
    illust: "/how-it-works/illust-1.svg",
  },
  {
    title: "Our team + AI Builds the System",
    description:
      "Tglobal generates architecture, code, and core logic in one continuous flow, eliminating manual setup and reducing development time drastically.",
    illust: "/how-it-works/illust-2.svg",
  },
  {
    title: "Launch and Evolve",
    description:
      "Deploy instantly and iterate continuously. Your product adapts, improves, and scales with AI-driven updates.",
    illust: "/how-it-works/illust-3.svg",
  },
] as const;

/* ─── SCROLL FEEL ──────────────────────────────────────────── */
/**
 * Fraction of the pinned scroll range that's a "settle" beat — the section
 * stays locked centre-of-viewport while the user feels the pin engage,
 * before any card translation begins. 0.20 = 20% of pin scroll. Raise to
 * 0.25–0.30 if the lock-in should feel longer; lower to 0.10–0.15 for a
 * snappier handover. Used by both the pin timeline and the pill-click
 * progress remap so they stay in sync.
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
    /** Figma exact: 420 × 509, rx 32. On viewports narrower than ~495px the
     *  card scales to 85vw so a 420px card never overflows a phone screen;
     *  desktop always renders at the fixed 420 since `min(85vw, 420)` caps
     *  there once 85vw ≥ 420 (i.e. above ~495px). */
    width: "min(85vw, 420px)",
    minHeight: 509,
    radius: 32,
    padding: 20,
    border: "#f5f6f8",
    /** Soft purple-tinted drop shadow (filter0_dddd in works.svg, 4 stacked
     *  blurs collapsed to a CSS shadow stack — same falloff, fraction of the
     *  paint cost). */
    shadow:
      "0px 14px 31px rgba(240,216,251,0.10), 0px 57px 57px rgba(240,216,251,0.09), 0px 129px 77px rgba(240,216,251,0.05), 0px 229px 92px rgba(240,216,251,0.01)",
  },
  illust: {
    /** Aspect ratio of the Figma illustration (380 × 376 ≈ 1.01:1). The
     *  SVG fills 100% of its container width via this ratio so it scales
     *  cleanly when the card is shrunk to 85vw on phones. */
    aspectRatio: "380 / 376",
    radius: 16,
    /** Soft radial wash of the Figma frame colour (#F7F7F7) fading to
     *  transparent before it reaches the wrapper edge. Replaces the old
     *  flat `bg: "#F7F7F7"`, which painted a hard rectangle that didn't
     *  blend into the white card. The matching `<rect fill="#F7F7F7"/>`
     *  inside each illust-N.svg has been stripped (extract step) so the
     *  wash is now the only frame the user sees. Centre y-bias 55% keeps
     *  the wash a touch lower than the geometric centre, matching the
     *  Services section's CardIllustration treatment. */
    bgGradient:
      "radial-gradient(ellipse 80% 70% at 50% 55%, rgba(247,247,247,1) 0%, rgba(247,247,247,0) 78%)",
  },
  cardGap: 20,
  pill: {
    width: 20,
    height: 7,
    gap: 4,
    activeColor: "#4B28FF",
    inactiveColor: "#EAECF0",
    /** One pill per card — N pills = STEPS.length so the indicator maps
     *  1:1 with the card the user is looking at. */
  },
  /**
   * Desktop (≥lg) layout — absolute positions taken from the 1440 × 800 Figma
   * frame and converted to clamp(min, vw_at_1440, max). The .vw fraction is
   * literally `figmaPx / 1440 * 100`, so at exactly 1440 viewport every value
   * lands on the Figma pixel; below that they scale proportionally; above that
   * they cap at the Figma value and the whole layout centres in the leftover
   * margin (max-width on the inner container).
   *
   *   Figma                         clamp expression
   *   ─────────────────────────     ────────────────────────────
   *   header  x = 80     y = 50%    left: clamp(40, 5.56vw, 80)
   *   header  w = 413               width: clamp(296, 28.68vw, 413)
   *   cards   x = 748    y = 146    left: clamp(532, 51.94vw, 748)
   *   pills   x = 930    y = 717.5  left: clamp(617, 64.58vw, 930)
   *
   * Cards are centred vertically (Figma top 146 + half card 254.5 = 400.5,
   * which is ≈ 800/2). Pills hang 62.5px below the card bottom — that gap
   * is preserved at every viewport via a `top: calc(50% + 317px)` offset
   * (half card 254.5 + gap 62.5).
   */
  desktop: {
    containerMaxWidth: 1440,
    sectionHeight: 800,
    padLeft: "clamp(40px, 5.56vw, 80px)",
    headerWidth: "clamp(296px, 28.68vw, 413px)",
    /* Card track + pills shifted ~120 px left of the original Figma
       positions (cardsLeft was 748 px / 51.94vw; pillsLeft was 930 px
       / 64.58vw). The shift is uniform: both values dropped by the
       same delta in absolute px, % of vw, and lower-bound min, so the
       gap between cards and pills (~182 px) is preserved across every
       viewport — pills still sit centred under the visible card area
       like the original layout. The header column (padLeft +
       headerWidth, ~493 px right edge at 1440) is untouched, so the
       gap between the heading copy and the first card just compresses
       from ~255 px to ~135 px — visibly tighter, but still has room
       to breathe. The pinned-scroll and cross-fade behaviour relies
       on the cards-area wrapper extending to `right: 0`, which is
       unchanged here, so all GSAP timelines keep working as-is. */
    cardsLeft: "clamp(412px, 43.61vw, 628px)",
    pillsLeft: "clamp(497px, 56.25vw, 810px)",
    /** Vertical offset from section centre to pills top edge (Figma: card
     *  bottom 655 + gap 62.5 = 717.5 → centre 400 + 317.5). Approximated to
     *  317 because pills are 7px tall and we anchor the top edge. */
    pillsTopFromCenter: "317px",
    /** 24px gap between header text rows (Figma "Frame 2147224..." Auto layout
     *  Gap = 24). */
    headerGap: "24px",
  },
  type: {
    // Header: eyebrow 32/32, heading 64/0.92 medium, description 24/1.15
    // — all -6% tracking, fluidly clamped down for mobile.
    eyebrow: {
      size: "clamp(20px, 2.22vw, 32px)",
      lineHeight: "1",
      tracking: "-0.06em",
      color: "#404040",
    },
    heading: {
      size: "clamp(36px, 4.44vw, 64px)",
      lineHeight: "0.92",
      tracking: "-0.06em",
      color: "#010101",
    },
    description: {
      size: "clamp(16px, 1.667vw, 24px)",
      lineHeight: "1.15",
      tracking: "-0.06em",
      color: "#404040",
    },
    cardTitle: {
      size: "24px",
      lineHeight: "1",
      tracking: "-0.06em",
      color: "#010101",
    },
    cardBody: {
      size: "14px",
      lineHeight: "1.5",
      tracking: "-0.06em",
      color: "#909090",
    },
  },
} as const;

/* ─── CARD ─────────────────────────────────────────────────── */
type Step = (typeof STEPS)[number];

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
      {/* Illustration frame — fills card width inside the 20px padding,
          height follows via aspect-ratio so internal proportions stay locked
          at every card width. The wrapper background is a soft radial wash
          (no hard rectangle); the matching `<rect fill="#F7F7F7"/>` was
          stripped from each illust-N.svg so the wash is the only frame. */}
      <div
        className="w-full overflow-hidden"
        style={{
          aspectRatio: TUNING.illust.aspectRatio,
          borderRadius: TUNING.illust.radius,
          background: TUNING.illust.bgGradient,
        }}
      >
        {/* Decorative static SVG: next/image adds no value here and would
            require dangerouslyAllowSvg in next.config. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={step.illust}
          alt=""
          width={380}
          height={376}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="block h-full w-full select-none"
        />
      </div>

      {/* Title + description — anchored below illustration with mt-auto so
          the text sits at the bottom of the card no matter how it scales. */}
      <div className="mt-auto flex flex-col gap-2 pt-4">
        <h3
          className="m-0 font-medium"
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
    </article>
  );
}

/* ─── PILLS ────────────────────────────────────────────────── */
/**
 * Renders just the pill list (no <nav> wrapper) — the calling layout owns
 * the nav landmark with its own aria-label so we can place it freely.
 *
 * Pills are interactive buttons: clicking one navigates the carousel to
 * the matching card. The `onSelect(index)` callback is invoked with the
 * pill index; the caller decides how to scroll (GSAP on desktop, native
 * smooth scroll on mobile).
 */
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
      // The 8px floor on phones keeps adjacent pills tappable without overlap; on
      // tablet/desktop the cursor doesn't need the breathing room so we honor Figma.
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
 * The Figma "Frame 2147224..." auto-layout block is 413 × 315 with
 * Gap = 24 between rows: eyebrow → heading (3 lines) → description.
 * We don't render the pills inside the header anymore — desktop pills are
 * absolute-positioned in the section frame at x=930, y=717.5 per Figma.
 */
function Header() {
  return (
    <header
      className="flex flex-col"
      style={{ gap: TUNING.desktop.headerGap }}
    >
      <p className="eyebrow m-0">{COPY.eyebrow}</p>
      <h2
        id="how-it-works-heading"
        className="m-0 font-medium"
        style={{
          fontSize: TUNING.type.heading.size,
          lineHeight: TUNING.type.heading.lineHeight,
          letterSpacing: TUNING.type.heading.tracking,
          color: TUNING.type.heading.color,
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
        }}
      >
        {COPY.description}
      </p>
    </header>
  );
}

/* ─── SECTION ─────────────────────────────────────────────── */
export default function HowItWorks() {
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
    /* Earlier-in-DOM pinned section, so it must refresh BEFORE Services.
       Higher number = earlier refresh. See the option's JSDoc in
       usePinnedHorizontalScroll for the full rationale. */
    refreshPriority: 2,
    /* True cross-fade handover. Without this, only HowItWorks's viewport
       fades during the dissolve and Services materialises by occlusion-
       reveal (geometric translate-in at full opacity), which reads as a
       "pop" once HowItWorks reaches autoAlpha 0. With this, Services's
       pinned viewport fades IN simultaneously, distributing the rate of
       visible change across the whole fade window. Selector resolves to
       Services's `bg-white h-screen` lg:block viewport (nested inside
       its pin-spacer wrapper, hence the descendant combinator). */
    nextHandoverSelector: "#services div.h-screen.bg-white",
  });

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      aria-labelledby="how-it-works-heading"
      className="relative w-full"
      style={{ background: TUNING.background }}
    >
      {/* ─── Mobile/tablet (<lg): stacked, native horizontal scroll ─────── */}
      <div
        className="flex flex-col gap-10 px-[var(--hiw-side-mobile)] py-[var(--hiw-y-mobile)] sm:px-[var(--hiw-side-tablet)] lg:hidden"
        style={
          {
            ["--hiw-side-mobile" as string]: TUNING.pad.sideMobile,
            ["--hiw-side-tablet" as string]: TUNING.pad.sideTablet,
            ["--hiw-y-mobile" as string]: TUNING.pad.yMobile,
          } as React.CSSProperties
        }
      >
        <Header />

        {/* Cards strip — overflow-x with snap. Negative margin + matching
            padding lets the first card hug the viewport edge while still
            snapping cleanly when scrolled. */}
        <div
          ref={mobileTrackRef}
          className="-mx-[var(--hiw-side-mobile)] flex snap-x snap-mandatory gap-5 overflow-x-auto px-[var(--hiw-side-mobile)] pb-2 sm:-mx-[var(--hiw-side-tablet)] sm:px-[var(--hiw-side-tablet)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {STEPS.map((step) => (
            <StepCard key={step.title} step={step} />
          ))}
        </div>

        <nav aria-label="Carousel progress">
          <ScrollPills active={active} onSelect={onPillSelect} />
        </nav>
      </div>

      {/* ─── Desktop (≥lg): pinned scroll, Figma-exact absolute positions ─
          The viewport is 100vh tall while pinned. Inside, an inner frame is
          1440-capped and 800 tall, auto-centred — that frame is the Figma
          reference; everything inside positions absolutely against it.
          Below 1440 the inner frame shrinks with the viewport and the
          clamp() values scale proportionally; above 1440 the frame caps and
          the whole composition centres in the leftover margin.

          Why `bg-white` lives on THIS element (not the parent <section>):
            ScrollTrigger pins this `viewportRef` with `pinType: "fixed"`
            (default for window-scroller pins). During pin the element is
            `position: fixed; top: 0; left: 0` — taken out of the document
            flow visually. The parent section's white background still paints
            its own box correctly, but the fixed viewport is a separate
            stacking layer floating over whatever content is currently
            scrolled underneath it (i.e. the next section sliding up under
            the pin spacer). If the viewport itself is transparent, the next
            section's heading and cards bleed through and you see two
            sections layered. Painting the viewport opaque white closes that
            window — the next section is fully occluded until pin releases. */}
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
            {/* Header — Figma x=80, y=243, w=413. Vertical centre lands at
                y=400.5 (≈ frame centre 400) so we anchor by translateY. */}
            <div
              className="absolute"
              style={{
                left: TUNING.desktop.padLeft,
                top: "50%",
                transform: "translateY(-50%)",
                width: TUNING.desktop.headerWidth,
              }}
            >
              <Header />
            </div>

            {/* Cards-area wrapper — `right: 0` extends to the inner frame's
                right edge, `overflow-hidden` clips the track. Without the
                clip, when GSAP translates the track left, Card 1 leaks past
                x=cardsLeft into the header column and paints over the
                heading. The wrapper handles vertical centring (flex
                items-center) so the track only carries GSAP's horizontal
                translate — if both lived on the same element GSAP's
                transform write would clobber a translateY.

                Bilateral soft fade mask:
                  `overflow-hidden` alone produces sharp vertical cuts at
                  both edges of the wrapper — cards translating left
                  snap from fully visible to clipped at the LEFT edge,
                  and on initial state (or when scrolling backward) the
                  rightmost partially-visible card also clips at a hard
                  RIGHT edge. We layer a `mask-image` with horizontal
                  alpha gradients on both sides (transparent at 0% →
                  opaque from 6% → opaque to 94% → transparent at 100%)
                  so cards entering or leaving either edge dissolve
                  smoothly instead of clipping. The gradient stops are
                  percentages so the fade scales with the wrapper width
                  across viewports. Both -webkit-mask-image and
                  mask-image are set for cross-browser coverage. */}
            <div
              className="absolute inset-y-0 flex items-center overflow-hidden"
              style={{
                left: TUNING.desktop.cardsLeft,
                right: 0,
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
                maskImage:
                  "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
              }}
            >
              <div
                ref={trackRef}
                className="flex items-stretch will-change-transform"
                style={{ gap: TUNING.cardGap }}
              >
                {STEPS.map((step) => (
                  <StepCard key={step.title} step={step} />
                ))}
              </div>
            </div>

            {/* Pills — Figma x=930, y=717.5 (62.5px below the card bottom).
                Anchored to frame centre + 317 so the gap below cards is
                preserved at every viewport size. */}
            <nav
              aria-label="Carousel progress"
              className="absolute"
              style={{
                left: TUNING.desktop.pillsLeft,
                top: `calc(50% + ${TUNING.desktop.pillsTopFromCenter})`,
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
