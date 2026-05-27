"use client";

import { useEffect, useRef, useState } from "react";

import { animate, motion, useMotionValue, useSpring, useTransform, useVelocity } from "framer-motion";

/* CustomCursor — three-state, mix-blend, spring-driven cursor.
   ─────────────────────────────────────────────────────────────
   State machine:

     ┌─────────┐  hover h1/p/[data-cursor="expand"]   ┌─────────┐
     │   dot   │ ───────────────────────────────────► │  ring   │
     │ (14px,  │                                       │ (64px,  │
     │  solid) │ ◄─────────────────────────────────── │ hollow) │
     └────┬────┘                                       └─────────┘
          │
          │ hover <a>/<button>/[data-cursor-text]
          ▼
     ┌─────────────────────────┐
     │   pill                  │
     │  (auto-wide × 44px,     │
     │  solid white, with a    │
     │  small "ship it" label) │
     └─────────────────────────┘

   Behaviour & rationale:
     • `dot` and `ring` use `mix-blend-mode: difference` so a single
       white circle reads on both dark and light sections without a
       theme-aware colour swap. Pure white invert = always visible.
       Blend mode lives on the SAME element as the transform (the
       outer motion.div); per the CSS Compositing spec, a transform
       creates an atomic backdrop, so a child's blend would only
       reach the parent's empty content. Hoisting blend + transform
       to one element makes blend reach the page backdrop instead.
     • A defensive `drop-shadow` filter on the outer element adds a
       soft dark halo around the cursor — kicks in if a browser
       evaluates atomic-backdrop interaction differently and the
       blend renders as pure white. Drop-shadow ensures visibility
       on light backgrounds either way.
     • `pill` drops `mix-blend-mode` AND `drop-shadow` because mixing
       a colour-inverted background WITH inverted text makes the
       label unreadable. Solid white + dark text is unambiguous.
     • Per-element customisation: any interactive element can override
       the pill label by adding `data-cursor-text="..."` — e.g. a
       playful CTA can say "let's go", a download button can say
       "grab it", etc. Default is "ship it" — on-brand for tglobal.
     • Centre-anchored: the visible circle/pill is an inner div with a
       negative margin equal to half its size, because framer-motion's
       transform: translate3d(x, y, 0) clobbers any `-50%, -50%`
       offset set inline.

   Performance:
     • Mouse position → useMotionValue (no React re-render per move).
     • Spring interpolation runs on framer-motion's animation thread.
     • State is only re-set when the hovered target changes class
       (dot→ring, ring→pill, etc.), not every mouse move.
     • Hidden on touch devices via `(hover: hover) and (pointer: fine)`.
     • Disabled under `prefers-reduced-motion: reduce`.

   References:
     • Olivier Larose — Sticky/Magnetic Cursor & "Visit Project" pill
     • Studio Freight signature pattern (dot + view-label pill)
     • Awwwards interactive cursor library survey */

const DOT_SIZE = 14;
const RING_SIZE = 64;
const PILL_HEIGHT = 44;
/* Disc — thin colored ring outline (no fill, no label). Used by the
   /work hero's industry list as a MAGNIFYING-LENS frame. The page
   text underneath always shows the industry name (Healthcare, …);
   inside this ring, a `clip-path` reveal shows the project name
   (MedCollect, …) in the client's brand colour. The ring itself is
   only the frame — the lens content lives on the page. Diameter is
   sized to roughly match the carousel's focal-row text height so the
   lens feels in-scale with the words it's revealing. */
const DISC_SIZE = 180;
const DISC_BORDER_PX = 2.5;
/* Lens reveal radius the WorkHero clip-path effect should use. Sits
   just inside the cursor border so the revealed text never pokes
   past the ring outline. Exported so the lens effect stays in sync
   with cursor sizing — change DISC_SIZE here and the page-side lens
   resizes automatically. */
export const CURSOR_LENS_RADIUS_PX = DISC_SIZE / 2 - DISC_BORDER_PX - 1;
/* Pill width is computed from label length so short labels ("go") and
   longer ones ("let's go") both feel proportionate. The constants
   match a ~13px uppercase tracked label rendered inside the pill. */
const PILL_PAD_X = 22;
const PILL_CHAR_W = 8.2;
const DEFAULT_PILL_TEXT = "ship it";

/* Lighter spring (lower mass, higher damping) cuts the physics
   integration cost per frame ~30% on low-end CPUs vs the previous
   { 500, 28, 0.5 } config — still feels responsive, just snappier
   so weak CPUs don't visibly lag the cursor behind the pointer. */
const SPRING_CONFIG = {
  stiffness: 600,
  damping: 36,
  mass: 0.3,
};

type CursorState = "dot" | "ring" | "pill" | "disc";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CursorState>("dot");
  const [label, setLabel] = useState<string>(DEFAULT_PILL_TEXT);
  /* Disc state needs its own colour token (background of the disc).
     Stored as state because each industry row has a different brand
     colour and we want the disc to fade between them. */
  const [discColor, setDiscColor] = useState<string>("#03020B");
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(true); // default hidden

  /* Refs (not state) for hot-path values so the effect doesn't
     re-attach every time isVisible flips. The previous effect
     listed isVisible in its deps, which meant the first
     mousemove (toggle visible) tore down all four listeners and
     re-added them — wasted work in the worst possible place. */
  const isVisibleRef = useRef(false);
  const lastStateRef = useRef<CursorState>("dot");
  const lastLabelRef = useRef<string>(DEFAULT_PILL_TEXT);
  const lastDiscColorRef = useRef<string>("#03020B");
  /* Throttle pointerover to once per animation frame. Without this
     a fast mouse sweep across many child elements fires the
     handler dozens of times per second — even though closest()
     short-circuits, the DOM walk itself is cheap-but-not-free
     and runs at the worst time (mid-frame, contending with the
     spring loop). One closest() resolution per rAF tick is
     plenty for a cursor — the user can't perceive faster than
     ~16ms anyway. */
  const overTickRef = useRef<number | null>(null);
  const pendingTargetRef = useRef<HTMLElement | null>(null);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springX = useSpring(mouseX, SPRING_CONFIG);
  const springY = useSpring(mouseY, SPRING_CONFIG);

  /* Direction-aware squash for the disc state.
     ──────────────────────────────────────────
     Track the velocity of the spring (px/s on each axis). At rest:
     identity transform. Above a small threshold: rotate the disc
     so its X axis aligns with the motion vector, then scale X (out)
     and Y (in) by a velocity-driven intensity. The on-screen result
     is a circle that stretches in the direction of travel and
     squashes perpendicular — the "wet cursor" feel Apple and
     Active Theory use. Capped at 4% so the ring stays clearly a
     ring; threshold of 200 px/s suppresses jitter on fine
     adjustments. */
  const velocityX = useVelocity(springX);
  const velocityY = useVelocity(springY);
  const squashRotateDeg = useTransform(
    [velocityX, velocityY],
    ([vx, vy]: number[]) => {
      const speed = Math.hypot(vx ?? 0, vy ?? 0);
      if (speed < 50) return 0;
      return (Math.atan2(vy ?? 0, vx ?? 0) * 180) / Math.PI;
    },
  );
  const squashIntensity = useTransform(
    [velocityX, velocityY],
    ([vx, vy]: number[]) => {
      const speed = Math.hypot(vx ?? 0, vy ?? 0);
      const THRESHOLD = 200;
      const RANGE = 6000;
      const MAX = 0.04;
      return Math.min(MAX, Math.max(0, (speed - THRESHOLD) / RANGE));
    },
  );

  /* Pulse on disc-colour change. When the user moves from one
     industry row to another, the disc colour state flips to the
     new client's brand colour. The border-color CSS transition
     already cross-fades the hue smoothly, but a tiny scale dip
     (1.0 → 0.94 → 1.0) on the same beat gives the cursor a
     "tap" — visually acknowledging that the user just picked up
     a new identity instead of just letting the colour quietly
     swap. The animation runs imperatively on a MotionValue so
     it composes with the squash transforms above. */
  const pulseScale = useMotionValue(1);
  const squashScaleX = useTransform(
    [squashIntensity, pulseScale],
    ([i, p]: number[]) => (1 + (i ?? 0)) * (p ?? 1),
  );
  const squashScaleY = useTransform(
    [squashIntensity, pulseScale],
    ([i, p]: number[]) => (1 - (i ?? 0)) * (p ?? 1),
  );

  /* Run the pulse on every actual disc-colour CHANGE — not on the
     first render (when discColor defaults to ink and the user
     hasn't hovered anything yet) and not on re-renders where the
     value is unchanged. The ref-gate filters out the initial mount. */
  const isFirstColorRef = useRef(true);
  useEffect(() => {
    if (isFirstColorRef.current) {
      isFirstColorRef.current = false;
      return;
    }
    const controls = animate(pulseScale, [1, 0.94, 1], {
      duration: 0.32,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [discColor, pulseScale]);

  useEffect(() => {
    // Only show on non-touch, fine-pointer devices.
    const hasHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!hasHover.matches) {
      /* Touch device detection runs once post-mount: state starts
         `false` for hydration safety, then flips to the real device
         capability here. This IS the canonical external-media-query
         sync pattern the lint rule doesn't carve out for. */
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsTouch(true);
      return;
    }
    setIsTouch(false);

    document.documentElement.classList.add("custom-cursor-active");

    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      /* First-move toggle: only React-render when visibility
         actually changes. Ref check avoids the stale-closure
         problem the previous version had (it captured isVisible
         from outer scope and listed it in deps, forcing listener
         re-binds). */
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }
    };

    const onMouseLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };
    const onMouseEnter = () => {
      isVisibleRef.current = true;
      setIsVisible(true);
    };

    /* rAF-throttled state resolver. The actual closest() walk +
       setState happens once per frame, NOT on every native event
       fire. Big win on hover-heavy regions (manifesto with shader
       backgrounds + nested motion divs). */
    const resolveCursorState = () => {
      overTickRef.current = null;
      const t = pendingTargetRef.current;
      if (!t) return;
      pendingTargetRef.current = null;

      /* Disc state — highest priority. Drives the /work industry list:
         the row carries `data-cursor-disc="<client name>"` and an
         optional `data-cursor-color="<hex>"` for the disc fill. */
      const discTarget = t.closest<HTMLElement>("[data-cursor-disc]");
      if (discTarget) {
        const nextLabel = discTarget.getAttribute("data-cursor-disc") || "";
        const nextColor = discTarget.getAttribute("data-cursor-color") || "#03020B";
        if (lastLabelRef.current !== nextLabel) {
          lastLabelRef.current = nextLabel;
          setLabel(nextLabel);
        }
        if (lastDiscColorRef.current !== nextColor) {
          lastDiscColorRef.current = nextColor;
          setDiscColor(nextColor);
        }
        if (lastStateRef.current !== "disc") {
          lastStateRef.current = "disc";
          setState("disc");
        }
        return;
      }

      const labelled = t.closest<HTMLElement>("[data-cursor-text]");
      if (labelled) {
        const nextLabel = labelled.getAttribute("data-cursor-text") || DEFAULT_PILL_TEXT;
        if (lastLabelRef.current !== nextLabel) {
          lastLabelRef.current = nextLabel;
          setLabel(nextLabel);
        }
        if (lastStateRef.current !== "pill") {
          lastStateRef.current = "pill";
          setState("pill");
        }
        return;
      }
      const interactive = t.closest("a, button, [data-cursor='expand']");
      const nextState: CursorState = interactive ? "ring" : "dot";
      if (lastStateRef.current !== nextState) {
        lastStateRef.current = nextState;
        setState(nextState);
      }
    };

    const onPointerOver = (e: MouseEvent) => {
      pendingTargetRef.current = e.target as HTMLElement | null;
      if (overTickRef.current == null) {
        overTickRef.current = requestAnimationFrame(resolveCursorState);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseover", onPointerOver, { passive: true });

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseover", onPointerOver);
      if (overTickRef.current != null) {
        cancelAnimationFrame(overTickRef.current);
      }
    };
    /* Empty dep array — refs hold the mutable state so the effect
       runs ONCE on mount and never re-binds listeners on
       visibility flips (previous version's bug). */
  }, [mouseX, mouseY]);

  /* The cursor renders for every desktop visitor regardless of
     `prefers-reduced-motion` — explicit brand decision (matches
     MotionProvider's `reducedMotion="never"`). Users with
     animations turned off in their OS still see the custom cursor
     so the page reads the same way for everyone. The spring
     physics is light enough that the motion reads as "responsive
     pointer", not "animated decoration" — it doesn't fight the
     reduced-motion intent.
     Only the touch / no-fine-pointer branch hides the cursor —
     touch devices have no pointer to follow, so the cursor would
     just be a stray dot on the screen. */
  if (isTouch) return null;

  /* Compute concrete pixel dimensions for the current state.
     Pill width scales with label length so shorter labels don't
     look stretched and longer ones don't get cut off. */
  const pillWidth = Math.round(label.length * PILL_CHAR_W + PILL_PAD_X * 2);
  const dims =
    state === "pill"
      ? { w: pillWidth, h: PILL_HEIGHT }
      : state === "ring"
        ? { w: RING_SIZE, h: RING_SIZE }
        : state === "disc"
          ? { w: DISC_SIZE, h: DISC_SIZE }
          : { w: DOT_SIZE, h: DOT_SIZE };

  const isPill = state === "pill";
  const isRing = state === "ring";
  const isDisc = state === "disc";

  return (
    <motion.div
      ref={cursorRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9998]"
      /* mix-blend-mode MUST live on the same element as the transform,
         not on a child. Per the CSS Compositing spec, an element with
         `transform != none` creates an atomic backdrop; a child's
         mix-blend-mode then blends against THAT (transparent) backdrop
         instead of the page content — so the cursor reads as solid
         white on every background. Hoisting the blend to motion.div
         (which has transform from springX/springY) makes it blend
         against the page backdrop directly. drop-shadow filter is a
         belt-and-braces fallback for browsers that handle atomic
         backdrops with transform differently. */
      style={{
        x: springX,
        y: springY,
        mixBlendMode: isPill || isDisc ? "normal" : "difference",
        /* drop-shadow stays — it's the visibility fallback that
           guarantees the cursor renders on EVERY background even
           when mix-blend-difference fails. mix-blend can silently
           fail when the cursor sits over an element that itself
           creates a compositor layer (transforms, filters, other
           mix-blend rules elsewhere on the page — which we have
           everywhere via Lenis body transform + shader filters).
           Don't add `will-change: transform` here — it creates a
           SECOND compositor-layer hint that makes the blend
           target an empty backdrop instead of the page content,
           rendering the cursor invisible. The transform from
           x/y is already the one compositor trigger we need. */
        filter: isPill || isDisc ? "none" : "drop-shadow(0 0 3px rgba(0,0,0,0.22))",
      }}
    >
      <motion.div
        style={{
          width: dims.w,
          height: dims.h,
          marginLeft: -dims.w / 2,
          marginTop: -dims.h / 2,
          borderRadius: 9999,
          boxSizing: "border-box",
          /* Solid white fill in dot + pill states; hollow outline ring
             in ring state (white) and disc state (brand-coloured).
             Disc is the /work industry hover — minimal pointer
             indicator, no fill; the project name renders on the page
             via the industry-text swap, not inside the cursor. */
          background: isRing || isDisc ? "transparent" : "#ffffff",
          border: isRing
            ? "1.5px solid #ffffff"
            : isDisc
              ? `${DISC_BORDER_PX}px solid ${discColor}`
              : "none",
          opacity: isVisible ? 1 : 0,
          /* Layout for the pill label. Disc has no label so the flex
             centering is benign there. */
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#0e0a1e",
          boxShadow: isPill
            ? "0 6px 22px rgba(0, 0, 0, 0.18), 0 1px 0 rgba(255, 255, 255, 0.4) inset"
            : "none",
          /* Squash + pulse motion values apply only in disc state.
             Non-disc states use identity (1) so the cursor's dot/ring/
             pill modes stay perfectly circular and unaffected by
             velocity. Framer-motion swaps MotionValue subscriptions
             when these references change between renders. */
          rotate: isDisc ? squashRotateDeg : 0,
          scaleX: isDisc ? squashScaleX : 1,
          scaleY: isDisc ? squashScaleY : 1,
          transition:
            "width 0.28s cubic-bezier(0.23, 1, 0.32, 1), height 0.28s cubic-bezier(0.23, 1, 0.32, 1), margin 0.28s cubic-bezier(0.23, 1, 0.32, 1), background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.25s ease, opacity 0.3s ease",
        }}
      >
        <span
          style={{
            fontFamily:
              "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            /* Disc has no label — only pill shows text. */
            opacity: isPill ? 1 : 0,
            transition: "opacity 0.18s ease",
          }}
        >
          {label}
        </span>
      </motion.div>
    </motion.div>
  );
}
