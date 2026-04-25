"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/components/primitives/SmoothScrollProvider";
import { useCallback, useEffect, useRef, useState } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

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
  heading: ["From Idea to", "Production —", "Instantly"],
  description:
    "We utilise AI models and combine them with your ideas to build scalable products.",
} as const;

/* ─── STEPS ────────────────────────────────────────────────── */
const STEPS = [
  {
    title: "Define Your Idea",
    description:
      "Start with intent, not complexity. Describe what you want to build — from features to workflows — and Tglobal translates it into a structured product blueprint.",
    illust: "/how-it-works/illust-1.svg",
  },
  {
    title: "Our team + AI Builds the System",
    description:
      "Tglobal generates architecture, code, and core logic in one continuous flow — eliminating manual setup and reducing development time drastically.",
    illust: "/how-it-works/illust-2.svg",
  },
  {
    title: "Launch and Evolve",
    description:
      "Deploy instantly and iterate continuously. Your product adapts, improves, and scales with AI-driven updates.",
    illust: "/how-it-works/illust-3.svg",
  },
] as const;

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
    bg: "#F7F7F7",
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
    cardsLeft: "clamp(532px, 51.94vw, 748px)",
    pillsLeft: "clamp(617px, 64.58vw, 930px)",
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
          at every card width. The SVG itself embeds the same gray frame,
          so this wrapper is also a CLS reservation. */}
      <div
        className="w-full overflow-hidden"
        style={{
          aspectRatio: TUNING.illust.aspectRatio,
          borderRadius: TUNING.illust.radius,
          background: TUNING.illust.bg,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element
            ── decorative static vector; using next/image adds no value for
               SVG and would require dangerouslyAllowSvg in next.config */}
        <img
          src={step.illust}
          alt=""
          width={380}
          height={376}
          loading="lazy"
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
      <p
        className="m-0"
        style={{
          fontSize: TUNING.type.eyebrow.size,
          lineHeight: TUNING.type.eyebrow.lineHeight,
          letterSpacing: TUNING.type.eyebrow.tracking,
          color: TUNING.type.eyebrow.color,
        }}
      >
        {COPY.eyebrow}
      </p>
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
  /** Stored so pill clicks can ask ScrollTrigger for its current pin range
   *  and animate window.scrollY into it. We can't read it from refs because
   *  ScrollTrigger lives outside the React tree. */
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  /** Last active index sent to React. ScrollTrigger.onUpdate fires every
   *  frame; without this guard we'd call setActive on every frame and pay
   *  for React's reconciliation even when the rounded index hasn't changed.
   *  With it, setActive only runs at the 2 transition points across the
   *  full scroll range. */
  const lastActiveRef = useRef(0);
  const [active, setActive] = useState(0);
  /** Global Lenis instance from SmoothScrollProvider. We use it to drive
   *  programmatic scrolls (pill clicks) — `window.scrollTo()` jumps
   *  instantly because Lenis intercepts wheel events but not scrollTo
   *  calls, so we route through Lenis's own animator instead. */
  const lenis = useLenis();

  /* Desktop pinned scroll
     ─────────────────────────────────────────────────────────
     The pattern is GSAP's recommended "vertical-to-horizontal" pin: the
     section sticks at the top of the viewport, vertical scroll input is
     translated into a CSS transform on the inner track, and once the track
     finishes traveling the section unpins so the page scroll continues.
     Reverse direction (scrolling back up) just plays the same translate
     in reverse.

     Smoothing strategy with Lenis present:
       Lenis interpolates wheel/trackpad input over ~150ms (lerp 0.1) and
       drives `window.scrollY` itself. ScrollTrigger reads that smoothed
       value via `lenis.on("scroll", ScrollTrigger.update)` set up in
       SmoothScrollProvider. So Lenis is the SOLE smoother — ScrollTrigger
       must run 1:1 against it (`scrub: true`) or we get compound
       interpolation that lags the cards a full second behind the wheel
       and feels like "the screen is shaking".

     What we deliberately do NOT use here:
       - `snap`             Calls `gsap.to(window, { scrollTo: y })` under
                            the hood, which Lenis doesn't intercept; the
                            page jumps, Lenis's internal target desyncs,
                            and the next wheel snaps you back. To enable
                            snap with Lenis we'd need scrollerProxy or a
                            custom snap-via-lenis.scrollTo path; not worth
                            the complexity for 3 cards. Pills give users
                            direct card navigation instead.
       - `pinType` override Window-scroller default is "fixed", which is
                            cheaper and more predictable than "transform".
                            We let GSAP pick.
       - `anticipatePin`    Made sense to mask 1-frame lag with raw scroll;
                            with Lenis driving the position, the pin
                            engages on the smoothed value already.
       - `fastScrollEnd`    Coupled with snap. Without snap there's nothing
                            to "force to completion".

     - scrub: true         1:1 with Lenis-smoothed scroll. Lenis owns
                           timing; ScrollTrigger is a pure mapper.
     - invalidateOnRefresh ScrollTrigger.refresh() is invoked on resize;
                           this re-runs `getDistance()` against the new
                           wrapper.clientWidth.
     - matchMedia gate     Pin only above lg. Below lg the pin code path
                           never registers (no GSAP cost on phones). We do
                           NOT gate on `prefers-reduced-motion: no-preference`
                           because the pin is a user-driven content reveal,
                           not an autoplay animation. */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const viewport = viewportRef.current;
        const track = trackRef.current;
        if (!viewport || !track) return;

        /* The track's parent is now an `overflow-hidden` cards-area wrapper
           (left=cardsLeft, right=0) that clips cards from bleeding into
           the header column. The amount the track has to travel to bring
           its last card flush with the wrapper's right edge is exactly
           `track.scrollWidth - wrapper.clientWidth`. */
        const getDistance = () => {
          const wrapper = track.parentElement;
          if (!wrapper) return 0;
          return Math.max(0, track.scrollWidth - wrapper.clientWidth);
        };

        const stops = STEPS.length - 1; // 2 gaps between 3 cards

        const tween = gsap.to(track, {
          x: () => -getDistance(),
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: viewport,
            start: "top top",
            end: () => `+=${getDistance()}`,
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              /* Map continuous progress to a single active pill. With
                 `Math.round` and stops=2 we get 0 for [0..0.25], 1 for
                 (0.25..0.75], 2 for (0.75..1] — pill flips at the
                 midpoint between cards. Deduped via `lastActiveRef` so
                 React only re-renders the pill row at transitions, not
                 on every Lenis frame. */
              const idx = Math.min(
                STEPS.length - 1,
                Math.max(0, Math.round(self.progress * stops)),
              );
              if (idx !== lastActiveRef.current) {
                lastActiveRef.current = idx;
                setActive(idx);
              }
            },
          },
        });

        scrollTriggerRef.current = tween.scrollTrigger ?? null;

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          scrollTriggerRef.current = null;
        };
      });
      return () => mm.kill();
    },
    { scope: sectionRef },
  );

  /* Mobile pill sync — passive scroll listener on the horizontal track.
     CSS `scroll-snap-type: x mandatory` on the track gives us the same
     magnetic feel as ScrollTrigger.snap for free; this listener only mirrors
     the active card to the pill row. Same dedupe-via-ref pattern as desktop
     so React doesn't re-render on every wheel/touch frame. */
  useEffect(() => {
    const track = mobileTrackRef.current;
    if (!track) return;

    const stops = STEPS.length - 1;
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      if (max <= 0) {
        if (lastActiveRef.current !== 0) {
          lastActiveRef.current = 0;
          setActive(0);
        }
        return;
      }
      const progress = track.scrollLeft / max;
      const idx = Math.min(
        STEPS.length - 1,
        Math.max(0, Math.round(progress * stops)),
      );
      if (idx !== lastActiveRef.current) {
        lastActiveRef.current = idx;
        setActive(idx);
      }
    };

    update();
    track.addEventListener("scroll", update, { passive: true });
    return () => track.removeEventListener("scroll", update);
  }, []);

  /* Pill click → navigate to the corresponding card.
     ─────────────────────────────────────────────────────────
     Desktop: compute the page-Y that puts ScrollTrigger's progress at
     i/(N-1), then ask Lenis to scroll there. Lenis's animator runs the
     scroll on GSAP's ticker; ScrollTrigger sees the new positions on every
     tick and drives the cards with the existing scrub.

     Why `lenis.scrollTo` instead of `gsap.to(window, { scrollTo })`:
     GSAP's ScrollToPlugin calls `window.scrollTo()` directly, which Lenis
     doesn't intercept — the page would jump instantly and Lenis's internal
     target would desync. `lenis.scrollTo` updates Lenis's target so the
     smoothed position animates correctly.

     Mobile: scroll the horizontal track to the chosen card's offsetLeft.
     The track is a CSS overflow container, not the page scroll, so Lenis
     doesn't manage it — `behavior: "smooth"` is the right tool. */
  const onPillSelect = useCallback(
    (index: number) => {
      const stops = STEPS.length - 1;
      const target = Math.min(STEPS.length - 1, Math.max(0, index));

      const st = scrollTriggerRef.current;
      if (st) {
        const progress = target / stops;
        const targetY = st.start + progress * (st.end - st.start);
        if (lenis) {
          lenis.scrollTo(targetY, { duration: 0.6, lock: true });
        } else {
          /* Fallback if SmoothScrollProvider isn't mounted (e.g. during a
             dev-time HMR hiccup). Native smooth scroll keeps the click
             responsive even when Lenis isn't available. */
          window.scrollTo({ top: targetY, behavior: "smooth" });
        }
        return;
      }

      const track = mobileTrackRef.current;
      if (!track) return;
      const cards = track.querySelectorAll<HTMLElement>("[data-step-card]");
      const card = cards[target];
      if (card) {
        track.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
      }
    },
    [lenis],
  );

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
          the whole composition centres in the leftover margin. */}
      <div
        ref={viewportRef}
        className="relative hidden h-screen w-full overflow-hidden lg:block"
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
                transform write would clobber a translateY. */}
            <div
              className="absolute inset-y-0 flex items-center overflow-hidden"
              style={{ left: TUNING.desktop.cardsLeft, right: 0 }}
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
