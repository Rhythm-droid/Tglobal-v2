"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";
import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, useState, type ReactNode } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Global smooth-scroll provider — Lenis + GSAP ScrollTrigger.
 * ────────────────────────────────────────────────────────────
 *
 * Why this exists:
 *   Native scroll on Windows + a wheel mouse is jittery (1-line steps), and
 *   the ScrollTrigger pin in HowItWorks magnifies that jitter on every
 *   scrub frame. Lenis interpolates between scroll deltas with an easing
 *   curve, turning those steps into a continuous slide. ScrollTrigger
 *   reads the smoothed position via `ScrollTrigger.update()` so pins,
 *   scrubs, and snaps all play against the eased value, not the raw one.
 *
 * The integration pattern (per Lenis + GSAP docs):
 *   1. `autoRaf: false` — Lenis would normally drive itself with its own
 *      requestAnimationFrame loop. We turn that off and feed it from GSAP's
 *      ticker instead, so the entire app runs on one rAF tick.
 *   2. `gsap.ticker.add(update)` — every GSAP tick calls `lenis.raf(time)`
 *      which advances Lenis's interpolation by exactly one frame.
 *   3. `lenis.on("scroll", ScrollTrigger.update)` — every time Lenis emits
 *      a new scroll position, we tell ScrollTrigger to recompute its
 *      progress values. Without this, ScrollTrigger only sees raw window
 *      scroll events, not Lenis's smoothed position, and pins desync.
 *   4. `gsap.ticker.lagSmoothing(0)` — GSAP's lag smoothing fakes elapsed
 *      time when frames are dropped. Lenis owns frame timing now, so we
 *      disable lag smoothing to let Lenis's interpolation be authoritative.
 *
 * Why a child component for the wiring:
 *   `useLenis()` only returns the Lenis instance once `<ReactLenis>` has
 *   mounted and constructed it. Reading `lenisRef.current.lenis` directly
 *   inside the parent's `useEffect` is timing-fragile because parent
 *   effects can race against ReactLenis's internal initialisation. Putting
 *   the wiring in a child whose `useEffect` watches `[lenis]` makes the
 *   integration deterministic — it attaches the moment Lenis exists,
 *   detaches when it goes away.
 *
 * Reduced motion:
 *   When the user has `prefers-reduced-motion: reduce`, we configure
 *   Lenis to behave as a passthrough rather than disabling it entirely.
 *   Specifically:
 *     • `smoothWheel: false` — wheel events use native scroll; no
 *       interpolation between deltas.
 *     • `lerp: 1` — no easing on Lenis's internal scroll target. Even
 *       if `lenis.scrollTo()` is called programmatically, it teleports.
 *     • `anchors: false` — anchor link clicks fall through to the
 *       browser default (instant jump).
 *   Lenis still mounts so `useLenis()` consumers and the GSAP sync
 *   keep working without conditional handling. This avoids the
 *   accessibility regression flagged in the WCAG audit (vestibular
 *   sensitivity around scroll interpolation) while preserving the
 *   pinned-scroll integration used by HowItWorks / Services.
 *
 *   Mid-session toggles of the `prefers-reduced-motion` setting fire
 *   a state update and would re-render the provider; ReactLenis's
 *   options aren't reactive after initial mount, so the practical
 *   effect requires a page reload. Acceptable trade-off — toggling
 *   the OS-level setting mid-page is rare.
 *
 * Programmatic scroll:
 *   Other components that want to jump scroll position should call
 *   `lenis.scrollTo(targetY, options)` (via the re-exported `useLenis`
 *   below). `window.scrollTo()` would jump instantly because Lenis
 *   intercepts wheel events but not direct scroll calls.
 * ────────────────────────────────────────────────────────────
 */

function GsapLenisSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    /* Drive Lenis from GSAP's ticker. One rAF for the whole app instead of
       Lenis's own rAF + GSAP's rAF, which would compete and cause jitter. */
    const update = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    /* Pipe each Lenis tick into ScrollTrigger so pinned/scrubbed animations
       sync with the eased scroll position rather than the raw one. */
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    /* Re-measure Lenis whenever ScrollTrigger refreshes.
       ──────────────────────────────────────────────────
       Why this matters: ScrollTrigger pins (HowItWorks, Services) insert a
       `pin-spacer` element at refresh time to keep document height stable
       while a section is `position: fixed`. Each spacer adds its pin range
       (~600–800 px per pinned section) to scrollHeight. Lenis caches
       scrollHeight in `instance.dimensions` and clamps its scroll target to
       that cached value. If we don't tell Lenis the document grew, the
       user wheel-scrolls fine until they hit the OLD (pre-spacer) bottom —
       Lenis stops accepting input and the page feels like it ends a
       section or two before the actual document end. `lenis.resize()` re-
       reads dimensions so its clamp matches the spacer-extended scrollHeight.

       We listen on `refresh` (not `refreshInit`) so DOM mutations are
       committed before we re-measure. */
    const onRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", onRefresh);

    /* ScrollTrigger reads document height when registering each instance.
       After Lenis attaches, refresh once so any triggers that registered
       before this effect ran (HowItWorks, Services, etc.) recompute their
       start/end against the correct scroll context. The `refresh` listener
       above also fires here so Lenis picks up the document height on this
       very first refresh.

       Why `requestAnimationFrame` instead of calling refresh inline:
         In dev (HMR) and on Next.js client-side route remounts this effect
         can fire while the user is mid-scroll inside a pinned section.
         A synchronous refresh during pin causes ScrollTrigger to tear down
         and rebuild the pin spacer (or, with `pinSpacing: false`, to flip
         the pinned element between fixed and static positioning) within
         the current paint frame — which the user sees as a one-frame
         layout flash. Deferring to the next animation frame pushes the
         refresh past the current paint so the rebuild happens between
         frames and is invisible. */
    const refreshHandle = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(refreshHandle);
      gsap.ticker.remove(update);
      lenis.off("scroll", onScroll);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
    };
  }, [lenis]);

  return null;
}

/* Tracks the user's `prefers-reduced-motion` setting. Lazy-init reads
 * the value synchronously on the client (so the very first Lenis
 * mount uses the correct options); the effect listens for runtime
 * changes for completeness, even though ReactLenis won't reactively
 * apply the new options after construction. SSR-safe — `typeof
 * window` guard returns false during server render. */
function useReducedMotionPref(): boolean {
  const [reduce, setReduce] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduce;
}

export default function SmoothScrollProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const reduceMotion = useReducedMotionPref();

  return (
    <ReactLenis
      root
      options={{
        /* Lenis would normally run its own rAF; we drive it from GSAP. */
        autoRaf: false,
        /* Linear interpolation factor between current and target scroll.
           ──────────────────────────────────────────────────────────────
           Lenis default is 0.1 (~150 ms catch-up). On a Windows wheel
           mouse, where deltas arrive in discrete 100–120 px bursts,
           that catch-up reads as "page is trailing my input." 0.08
           (~120 ms) is the snappiest value where wheel-tick jitter is
           still smoothed but the input lag isn't perceptible. Going
           lower than ~0.07 starts to expose individual wheel ticks
           again on slow scrolls. Lerp wins over `duration` when both
           are set, so we omit duration entirely.

           When `prefers-reduced-motion: reduce` is set, lerp jumps to
           1 (no smoothing) so Lenis behaves as a synchronous wrapper
           around native scroll. Vestibular-sensitive users get sharp,
           immediate scroll response. */
        lerp: reduceMotion ? 1 : 0.08,
        /* Wheel-delta multiplier. Default 1 leaves OS-reported deltas
           untouched (conservative on Windows where each notch is only
           ~100 px). 1.2 amplifies each notch by 20% so scrolling feels
           responsive without feeling "throw-y". Trackpad users already
           have high-precision deltas; this multiplier applies to both
           but the perceptual change is dominated by the wheel case.
           Reduced-motion drops back to 1 so deltas match native scroll. */
        wheelMultiplier: reduceMotion ? 1 : 1.2,
        /* Smooth wheel input (desktop) but not touch (mobile). Native
           inertia on touch already feels good; overriding it tends to
           fight against the OS's gesture handling. Disabled entirely
           when reduce-motion is set — prevents Lenis from interpolating
           between scroll positions (vestibular accessibility win). */
        smoothWheel: !reduceMotion,
        /* Anchor link routing. Default true so nav/footer jumps stay
           in sync with the single page-level scroll owner. Disabled
           under reduce-motion so anchor clicks teleport instantly via
           native browser behaviour rather than animating. */
        anchors: !reduceMotion,
      }}
    >
      <GsapLenisSync />
      {children}
    </ReactLenis>
  );
}

/** Re-export so consumers can `import { useLenis } from
 *  "@/components/primitives/SmoothScrollProvider"` without depending on
 *  `lenis/react` directly. Returns the global Lenis instance, or
 *  `undefined` if accessed outside the ReactLenis context. */
export { useLenis } from "lenis/react";
export type { Lenis };
