"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MeshGradient } from "@paper-design/shaders-react";

import { useMounted } from "@/lib/useMounted";
import { useLenis } from "@/components/primitives/SmoothScrollProvider";
import { INDUSTRIES } from "@/app/work/data";

import { WORK_HERO_COLORS } from "./workPalette";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/**
 * WorkHero — pinned ambient stage with a two-phase pixelate morph.
 *
 * Section is 2.4× viewport; an inner pin layer fills the viewport.
 * A single ScrollTrigger progress (0 → 1) drives the morph.
 *
 *   • Each phrase is rendered into its own off-screen <canvas> at full
 *     resolution.
 *   • A visible compositor <canvas> draws the active phrase by FIRST
 *     scaling it down to a target resolution (e.g. 8×4 pixels for max
 *     pixelation, 1920×1080 for sharp), THEN scaling it back up to
 *     viewport size with `imageSmoothingEnabled = false` — that's the
 *     nearest-neighbor upscale that produces the chunky pixel look.
 *   • Pixel size animates as a triangle wave: 1 → 64 → 1 across the
 *     scroll range. At progress 0.5 the text is fully chunked into
 *     ~16 horizontal blocks; the phase swap happens at that moment.
 *   • A random per-frame "flip" — every few frames we re-seed an
 *     offset on the downsample step, so when chunked, the pixels
 *     shimmer/shuffle position. Reads as if the pixels are alive,
 *     not frozen.
 *
 * Mesh background never stops; only the foreground canvas redraws.
 */

const PHASE_TEXTS = [
  { plain: "Work that ", accent: "ships." },
  { plain: "Nine Industries. ", accent: "One Team." },
] as const;

/* Per-client disc colour. Drives the custom-cursor disc fill when
   the user hovers an industry row in the editorial stack. Keys are
   the canonical client names returned by INDUSTRIES.clients. Values
   are intentionally idiosyncratic — each one is the client's own
   brand colour, not a generic palette — so the hover badge feels
   like a tiny tribute to each project. */
const CLIENT_COLORS: Record<string, string> = {
  "MedCollect": "#4FB39D",
  "Skyline": "#F6B54A",
  "Aliste": "#007AFF",
  "Jumbl": "#F0FF4E",
  "DellStore": "#1069F9",
  "Turpai": "#CF2E2E",
  "JIJIBAI": "#000000",
  "Radhey Fashion": "#E11D2A",
  "SunZero": "#FB923C",
  "RedPocket Mobile": "#EF4444",
};

/* Visible canvas resolution. We pick a fixed render box so the
   off-screen text canvases have a stable size regardless of viewport.
   2400×600 gives crisp text up to 4K with no rescale blur, and
   downsamples cleanly to integer pixel sizes (2400/64 = 37.5 → 8). */
const CANVAS_W = 2400;
const CANVAS_H = 600;

export default function WorkHero() {
  const mounted = useMounted();
  const lenis = useLenis();
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const visibleCanvasRef = useRef<HTMLCanvasElement>(null);
  /* Each phase has its own offscreen text canvas. Drawn once on
     mount, then sampled per-frame by the visible compositor. */
  const phaseCanvasRefs = useRef<[HTMLCanvasElement | null, HTMLCanvasElement | null]>([null, null]);

  const [phase, setPhase] = useState<0 | 1>(0);
  const phaseRef = useRef<0 | 1>(0);
  const progressRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  /* On-screen rendered font-size of the canvas text. Computed once
     fonts have loaded by taking the internal sharedFontSize and
     scaling by the canvas's display-vs-intrinsic ratio. The DOM side
     halves use this exact value so swapping canvas → DOM is
     visually invisible — same character height, same baseline. */
  const [domFontSize, setDomFontSize] = useState<number>(0);
  /* Ref to the resize handler so the useEffect cleanup can detach
     the window listener that was attached inside the font-ready
     promise (the handler isn't in scope at cleanup time otherwise). */
  const computeDomSizeRef = useRef<(() => void) | null>(null);
  /* Refs for the phase-3 reveal layers. Mutated directly from RAF
     (opacity + translateY) so we never trigger React re-renders for
     the 60 fps reveal. */
  const chipRailRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const leftHeadlineRef = useRef<HTMLDivElement>(null);
  const rightHeadlineRef = useRef<HTMLDivElement>(null);
  const canvasDeltaRef = useRef<number>(0);
  const domDeltaRef = useRef<number>(0);
  const canvasSpaceWidthRef = useRef<number>(0);
  const domSpaceWidthRef = useRef<number>(0);

  /* Render each phase's text into its own offscreen canvas exactly
     once. Text is centered, sized to the canvas height, and styled to
     match the live H1 (Albert Sans + Instrument Serif italic). */
  useEffect(() => {
    if (!mounted) return;
    const fontReady =
      typeof document !== "undefined" && "fonts" in document
        ? document.fonts.ready
        : Promise.resolve();

    fontReady.then(() => {
      /* Dynamically read the EXACT font families AND colours the DOM
         uses. The canvas was previously hard-coding `#03020B` for the
         plain ink and `#6b5ce7` for the italic accent — but the DOM
         resolves `text-foreground` to `--color-foreground` (#03020b)
         and `text-primary` to `--color-primary` (#4b28ff). The
         lavender mismatch (#6b5ce7 vs #4b28ff) was the visible "colour
         jump" the user reported on swap. Reading from CSS variables
         pins canvas colours to whatever the design tokens currently
         say, so a future palette change can't reintroduce the jump. */
      const rootStyle = getComputedStyle(document.documentElement);
      const sansFont = rootStyle.getPropertyValue("--font-albert-sans").trim() || '"Albert Sans", sans-serif';
      const serifFont = rootStyle.getPropertyValue("--font-instrument-serif").trim() || '"Instrument Serif", serif';
      const inkColor = rootStyle.getPropertyValue("--color-foreground").trim() || "#03020b";
      /* Accent (italic "One Team." / "ships.") uses the soft lavender
         specifically — NOT `--color-primary` (which is the deep
         `#4b28ff` brand violet). User feedback: deep violet reads as
         a colour jump on swap; the soft lavender feels editorial and
         continuous with the mesh background. Tunable here:
         lighter / more purple values stay on-brand; anything outside
         the lavender family will reintroduce a visible swap. */
      const accentColor = "#6b5ce7";

      /* First pass — find the SHARED font size that fits BOTH phrases
         within the canvas. We pick the smaller of the two so the
         morph never changes scale (both phases render at the exact
         same font size, so dissolve is geometric only). */
      const measureCtx = document.createElement("canvas").getContext("2d");
      const MAX_WIDTH = CANVAS_W - 240;
      let sharedFontSize = 360;
      if (measureCtx) {
        for (const phrase of PHASE_TEXTS) {
          let fs = 360;
          while (fs > 80) {
            measureCtx.font = `500 ${fs}px ${sansFont}`;
            if ("letterSpacing" in measureCtx) {
              measureCtx.letterSpacing = "-0.04em";
            }
            const pw = measureCtx.measureText(phrase.plain).width;
            measureCtx.font = `italic 400 ${fs}px ${serifFont}`;
            if ("letterSpacing" in measureCtx) {
              measureCtx.letterSpacing = "-0.03em";
            }
            const aw = measureCtx.measureText(phrase.accent).width;
            if (pw + aw <= MAX_WIDTH) break;
            fs -= 8;
          }
          if (fs < sharedFontSize) sharedFontSize = fs;
        }
      }

      // Measure and draw offscreen canvases first to capture exact text metrics
      for (let i = 0; i < 2; i++) {
        const off = document.createElement("canvas");
        off.width = CANVAS_W;
        off.height = CANVAS_H;
        const ctx = off.getContext("2d");
        if (!ctx) continue;

        const text = PHASE_TEXTS[i]!;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        const fontSize = sharedFontSize;
        ctx.font = `500 ${fontSize}px ${sansFont}`;
        if ("letterSpacing" in ctx) {
          ctx.letterSpacing = "-0.04em";
        }
        const plainW = ctx.measureText(text.plain).width;
        ctx.font = `italic 400 ${fontSize}px ${serifFont}`;
        if ("letterSpacing" in ctx) {
          ctx.letterSpacing = "-0.03em";
        }
        const accentW = ctx.measureText(text.accent).width;

        if (i === 1) {
          canvasDeltaRef.current = (plainW - accentW) / 2;
          ctx.font = `500 ${fontSize}px ${sansFont}`;
          if ("letterSpacing" in ctx) {
            ctx.letterSpacing = "-0.04em";
          }
          canvasSpaceWidthRef.current = ctx.measureText(" ").width;
        }

        const plainFont = `500 ${fontSize}px ${sansFont}`;
        const accentFont = `italic 400 ${fontSize}px ${serifFont}`;

        const totalW = plainW + accentW;
        const startX = (CANVAS_W - totalW) / 2;
        const y = CANVAS_H / 2 + 12; /* Optical centring tweak */

        /* Plain segment in foreground ink. */
        ctx.font = plainFont;
        if ("letterSpacing" in ctx) {
          ctx.letterSpacing = "-0.04em";
        }
        ctx.fillStyle = inkColor;
        ctx.fillText(text.plain, startX, y);

        /* Accent segment — italic Instrument Serif in brand primary. */
        ctx.font = accentFont;
        if ("letterSpacing" in ctx) {
          ctx.letterSpacing = "-0.03em";
        }
        ctx.fillStyle = accentColor;
        ctx.fillText(text.accent, startX + plainW, y);

        phaseCanvasRefs.current[i] = off;
      }

      /* DOM font-size that matches the canvas's RENDERED text width.
         ────────────────────────────────────────────────────────────
         The canvas renders text at `sharedFontSize` internal px, then
         the bitmap is displayed at `display_width / CANVAS_W` scale.
         CSS text uses the same font family + same em + same
         letter-spacing, so if DOM font-size equals canvas em scaled
         linearly by the SAME horizontal scale factor, the DOM text
         width will match the canvas displayed text width to within
         sub-pixel rounding. That's the property that keeps the split
         boundary visually anchored across the swap — no horizontal
         jump on either half.

         Note: this is a HORIZONTAL match. If the canvas is
         vertically anamorphic (display height != width × intrinsic
         aspect), the DOM text will appear slightly taller or shorter
         than the canvas text. That's an acceptable trade-off because
         a vertical mismatch reads as a subtle weight change, but a
         horizontal mismatch reads as a positional jump — which is
         exactly the bug the user reported.

         MANUAL TUNING:
         If a future change makes the vertical mismatch noticeable,
         add a small multiplier here (e.g. `0.95` to shrink, `1.05`
         to grow) — but tune in tiny steps (±2-3%) because larger
         changes WILL reintroduce horizontal jump. */
      const DOM_FONT_SIZE_MULTIPLIER = 1.0;

      const computeDomSize = () => {
        const dst = visibleCanvasRef.current;
        if (!dst) return;
        const r = dst.getBoundingClientRect();
        if (r.width <= 0) return;
        /* CRITICAL: the canvas element has horizontal padding
           (`px-6 sm:px-8 lg:px-14 xl:px-20`), which is part of the
           BORDER BOX returned by getBoundingClientRect().width but
           NOT part of the CONTENT BOX where the canvas bitmap
           actually renders. The bitmap is scaled to FIT the content
           area, so the "effective scale" of the canvas raster is
           `contentWidth / CANVAS_W`, not `borderWidth / CANVAS_W`.
           Using the border width here is what made DOM text render
           ~12% larger than the canvas display (the user's "text
           getting bigger on swap" bug). Subtract padding to recover
           the true display scale. */
        const cs = getComputedStyle(dst);
        const padLeft = parseFloat(cs.paddingLeft) || 0;
        const padRight = parseFloat(cs.paddingRight) || 0;
        const contentWidth = r.width - padLeft - padRight;
        const scaleX = contentWidth / CANVAS_W;
        setDomFontSize(Math.round(sharedFontSize * scaleX * DOM_FONT_SIZE_MULTIPLIER));

        /* Display-space delta and space width — used by the split
           offset math to keep the boundary between halves anchored
           where the canvas placed it. Both use scaleX (now content-
           box accurate) so they line up with the DOM font-size width. */
        domDeltaRef.current = canvasDeltaRef.current * scaleX;
        domSpaceWidthRef.current = canvasSpaceWidthRef.current * scaleX;
      };
      computeDomSize();
      /* Recompute on viewport resize — both the canvas display size
         AND the font size will recompute on next render. */
      window.addEventListener("resize", computeDomSize, { passive: true });
      /* Capture this for cleanup; useEffect's outer return uses it. */
      computeDomSizeRef.current = computeDomSize;

      /* Kick a paint pass immediately so the visible canvas has
         something to show before the first scroll event. */
      drawPixelated(0);
    });

    return () => {
      const handler = computeDomSizeRef.current;
      if (handler) {
        window.removeEventListener("resize", handler);
        computeDomSizeRef.current = null;
      }
    };
  }, [mounted]);

  /* Compositor — downsamples then upscales with nearest-neighbor.
     pixelSize = 1 → near-sharp; pixelSize = 64 → chunky blocks.
     The `flipSeed` parameter adds a sub-pixel offset on the downsample
     so the block alignment shifts per frame, giving the pixels life. */
  function drawPixelated(progress: number) {
    const dst = visibleCanvasRef.current;
    if (!dst) return;
    const ctx = dst.getContext("2d");
    if (!ctx) return;

    /* Morph is COMPRESSED to the first half of the section so the
       remaining runway (progress 0.50 → 1.00) is free for the split
       + industries carousel. Internally the triangle wave is the
       same shape it used to be (slope 2.5 across [0,1]) — we just
       remap progress into a sub-range. */
    const MORPH_END = 0.50;
    const morphP = Math.min(1, progress / MORPH_END);
    /* Triangle wave 0 → 1 → 0, peaking at morphP = 0.5
       (progress = 0.25 in section coords). */
    const morphWindow = Math.max(0, 1 - Math.abs(morphP - 0.5) * 2.5);
    /* pixelSize ramps from 1 (sharp) to 64 (chunky). Exponential
       feels more cinematic than linear — small movements at the
       start, dramatic chunking at the peak. */
    const pixelSize = 1 + Math.pow(morphWindow, 1.4) * 63;

    /* Phase flip at the morph peak. Switch when displacement is
       maximal so the viewer never sees a mid-morph clean text. */
    const newPhase: 0 | 1 = morphP < 0.5 ? 0 : 1;
    if (newPhase !== phaseRef.current) {
      phaseRef.current = newPhase;
      setPhase(newPhase);
    }

    const source = phaseCanvasRefs.current[newPhase];
    if (!source) return;

    /* Clear and draw. The trick:
         1. Disable image smoothing on the destination context.
         2. Draw source canvas onto destination at a tiny size
            (CANVAS_W / pixelSize wide).
         3. Read those pixels back as the basis, then scale UP to full
            destination — but the SECOND scale-up is where we get the
            nearest-neighbor block effect.
       In practice the browser can do both in one drawImage call when
       the same canvas is used as both source and dest. We use an
       intermediate small render. */
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, dst.width, dst.height);

    if (pixelSize <= 1.2) {
      /* Sharp pass — just blit the source canvas full-resolution. */
      ctx.drawImage(source, 0, 0, dst.width, dst.height);
      return;
    }

    /* Pixelated pass. Use a transient downsample on a separate
       hidden canvas so we don't fight read-modify-write artifacts on
       the destination. */
    const dw = Math.max(2, Math.floor(dst.width / pixelSize));
    const dh = Math.max(2, Math.floor(dst.height / pixelSize));

    /* Per-frame "flip" offset — shifts the downsample origin by a
       random fractional pixel so block alignment dances subtly. Kept
       at 0.08× pixelSize so the shuffle reads as a quiet shimmer, not
       an aggressive shake. */
    const flip = (Math.random() - 0.5) * pixelSize * 0.08;

    /* Reuse a singleton temp canvas so we don't allocate every frame.
       Stored on the function itself (TS doesn't love this — we wrap
       it on a refed object below). */
    const tmp = getTempCanvas();
    tmp.width = dw;
    tmp.height = dh;
    const tctx = tmp.getContext("2d");
    if (!tctx) return;
    tctx.imageSmoothingEnabled = false;
    tctx.clearRect(0, 0, dw, dh);
    tctx.drawImage(source, flip, flip, dw, dh);

    /* Upscale tmp back to destination with nearest-neighbor. */
    ctx.drawImage(tmp, 0, 0, dw, dh, 0, 0, dst.width, dst.height);
  }

  /* Phase-3 reveal — FOUR DISTINCT BEATS.
        ┌────────────────────────────────────────────────────────────┐
        │ progress       Beat        What happens                    │
        │ ───────────    ────        ────────────                    │
        │ 0.00 → 0.50    Morph       Pixelation runs, headline forms │
        │ 0.50 → 0.53    Hold        Sharp canvas headline sits      │
        │ 0.53 → 0.58    Split       Canvas → DOM swap. Halves slide │
        │                            outward AND scale down. Stack   │
        │                            is INVISIBLE.                   │
        │ 0.58 → 0.62    Fade-in     Industries FADE IN, no slide.   │
        │                            Healthcare (index 0) at center  │
        │                            already (carouselT = 0).        │
        │ 0.62 → 1.00    Carousel    Scroll-driven vertical          │
        │                            carousel: each industry moves   │
        │                            into center and grows; previous │
        │                            shrinks. 38% of scroll runway   │
        │                            for 8 transitions (Healthcare → │
        │                            Manufacturing → … → Telecom).   │
        └────────────────────────────────────────────────────────────┘
     ease-in-out cubic for split; ease-out cubic for fade. */
  function updateChipRail(progress: number) {
    const rail = chipRailRef.current;
    const wrapper = canvasWrapperRef.current;
    const left = leftHeadlineRef.current;
    const right = rightHeadlineRef.current;

    const SPLIT_START = 0.53;
    const SPLIT_END = 0.58;
    const FADE_END = 0.62;
    const CAROUSEL_END = 1.0;

    /* ── Beat: Split (0.53 → 0.58). Morph completes at 0.50; the
       sharp headline holds for ~0.03 progress before the split. */
    let splitT = (progress - SPLIT_START) / (SPLIT_END - SPLIT_START);
    if (splitT < 0) splitT = 0;
    else if (splitT > 1) splitT = 1;
    /* Ease-in-out cubic — gentle start, gentle settle. */
    const splitEased =
      splitT < 0.5 ? 4 * splitT * splitT * splitT : 1 - Math.pow(-2 * splitT + 2, 3) / 2;

    /* Canvas hides at SPLIT_START — the identical DOM headline takes
       over at the exact same position + size, so no flicker. */
    if (wrapper) {
      wrapper.style.opacity = progress >= SPLIT_START ? "0" : "1";
    }

    /* Side halves: invisible before SPLIT_START; appear at exactly
       the same on-screen size as the canvas text was at the SWAP
       frame (matched via domFontSize). They slide outward to their
       FINAL position which is computed from the industries column's
       actual rendered width PLUS a fixed gap.

       Tuning knob: change SIDE_GAP_PX below. Higher = more breathing
       room between the side text and the industries column. Same
       value used for BOTH sides so symmetry holds. */
    const SIDE_GAP_PX = 120;
    const sidesVisible = progress >= SPLIT_START;
    const scale = 1 - splitEased * 0.68;

    const railEl = rail;
    const ulEl = railEl ? (railEl.querySelector("ul") as HTMLElement | null) : null;
    const columnHalfWidth = ulEl ? ulEl.getBoundingClientRect().width / 2 : 320;
    const finalTravel = columnHalfWidth + SIDE_GAP_PX;

    /* Initial offset: at swap, the boundary between halves sits where
       the canvas placed it (offset by domDelta because plain is wider
       than accent). As splitEased ramps 0 → 1 we interpolate from that
       canvas-aligned start to the symmetric final position. */
    const domDelta = domDeltaRef.current;
    const domSpaceWidth = domSpaceWidthRef.current;
    const txLeft = (1 - splitEased) * (domDelta - domSpaceWidth) - splitEased * finalTravel;
    const txRight = (1 - splitEased) * domDelta + splitEased * finalTravel;

    if (left) {
      left.style.opacity = sidesVisible ? "1" : "0";
      left.style.transform = `translate3d(${txLeft}px, -50%, 0) scale(${scale})`;
    }
    if (right) {
      right.style.opacity = sidesVisible ? "1" : "0";
      right.style.transform = `translate3d(${txRight}px, -50%, 0) scale(${scale})`;
    }

    /* ── Beats: Fade-in (0.58 → 0.62) + Carousel (0.62 → 1.00).
       Healthcare (item index 0) is at center from the moment items
       become visible — carouselT starts at 0, which puts the UL in
       the offset position that aligns item 0 with viewport center.
       Items get a distance-based scale and opacity so the centered
       row reads SLIGHTLY LARGER (scale 1.3) than its neighbours
       (scale 0.85 at dist=1, falling off to 0.6 at the edges).

       The UL is uniformly translated each frame so that the
       fractional carousel index sits on the viewport's vertical
       midline. Items still occupy their natural flex-column layout —
       we never reorder, never reflow. Pure transform animation. */
    if (rail) {
      let fadeT = (progress - SPLIT_END) / (FADE_END - SPLIT_END);
      if (fadeT < 0) fadeT = 0;
      else if (fadeT > 1) fadeT = 1;
      const fadeEased = 1 - Math.pow(1 - fadeT, 3);

      let carouselT = (progress - FADE_END) / (CAROUSEL_END - FADE_END);
      if (carouselT < 0) carouselT = 0;
      else if (carouselT > 1) carouselT = 1;

      rail.style.opacity = String(fadeEased);
      rail.style.pointerEvents = fadeT >= 1 ? "auto" : "none";

      const ul = ulEl;
      if (ul) {
        const items = ul.querySelectorAll<HTMLLIElement>("li");
        const total = items.length;
        if (total >= 2) {
          /* Measure pitch from two adjacent items. offsetTop is
             layout-only (transforms don't affect it), so this stays
             stable even while we scale individual items. */
          const itemPitch = items[1]!.offsetTop - items[0]!.offsetTop;
          const centeredFractionalIndex = carouselT * (total - 1);
          const naturalCenterIdx = (total - 1) / 2;
          const ulOffset = (naturalCenterIdx - centeredFractionalIndex) * itemPitch;
          ul.style.transform = `translate3d(0, ${ulOffset}px, 0)`;
          ul.style.willChange = "transform";

          for (let i = 0; i < total; i++) {
            const dist = Math.abs(i - centeredFractionalIndex);
            /* Linear falloff with clamps. Center scale 1.55 makes the
               focal industry read significantly larger than its
               neighbours; falloff of 0.5 per step lets the neighbour
               only get a small bump (~1.05) while the center stays
               the visual anchor. Items at dist >= ~2 floor at 0.6.
               Opacity drops 0.3 per step so far items dim away. */
            const itemScale = Math.max(0.6, 1.55 - dist * 0.5);
            const itemOpacity = Math.max(0.2, 1.0 - dist * 0.3);
            const li = items[i]!;
            li.style.opacity = String(itemOpacity);
            li.style.transform = `scale(${itemScale})`;
            li.style.willChange = "opacity, transform";
          }
        }
      }
    }
  }

  /* Pin + scroll. Wrapped in useGSAP for auto-cleanup. */
  useGSAP(
    () => {
      if (typeof window === "undefined") return;
      const section = sectionRef.current;
      if (!section) return;

      const reducedMotion =
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
        false;
      if (reducedMotion) {
        /* Reduced-motion: skip the pin + animation entirely. Hide the
           canvas, place the side halves at their final split position,
           and render the industries as a static, fully-visible stack
           (no carousel transform — every item at scale 1.0 and opacity
           1.0 so the full list is readable without scroll). */
        drawPixelated(0);
        const wrapper = canvasWrapperRef.current;
        const left = leftHeadlineRef.current;
        const right = rightHeadlineRef.current;
        const rail = chipRailRef.current;
        const ul = rail?.querySelector("ul") as HTMLElement | null;
        const columnHalfWidth = ul ? ul.getBoundingClientRect().width / 2 : 320;
        const finalTravel = columnHalfWidth + 120;
        const finalScale = 0.32;

        if (wrapper) wrapper.style.opacity = "0";
        if (left) {
          left.style.opacity = "1";
          left.style.transform = `translate3d(${-finalTravel}px, -50%, 0) scale(${finalScale})`;
        }
        if (right) {
          right.style.opacity = "1";
          right.style.transform = `translate3d(${finalTravel}px, -50%, 0) scale(${finalScale})`;
        }
        if (rail) {
          rail.style.opacity = "1";
          rail.style.pointerEvents = "auto";
        }
        if (ul) {
          ul.style.transform = "none";
          ul.querySelectorAll<HTMLLIElement>("li").forEach((li) => {
            li.style.opacity = "1";
            li.style.transform = "none";
          });
        }
        return;
      }

      /* Sticky-based pin (CSS handles the visual pin via `position: sticky`
         on the inner layer). ScrollTrigger here ONLY tracks progress —
         no GSAP pin, no transform interference. This avoids the
         "transform: translate(0, sectionHeight - vh)" bug GSAP applies
         when pinning an inner absolute child whose containing block is
         the trigger section itself. */
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        onUpdate(self) {
          progressRef.current = self.progress;
        },
        /* Slow Lenis ONLY while the hero is scrolling through its
           240svh pin range — gives the pixelation morph time to
           breathe without affecting the rest of the page. Default
           wheelMultiplier is 1.2 (see SmoothScrollProvider); we drop
           to 0.55 here, which roughly doubles the scroll distance
           per wheel notch inside the morph. */
        onEnter() {
          if (lenis) lenis.options.wheelMultiplier = 0.55;
        },
        onEnterBack() {
          if (lenis) lenis.options.wheelMultiplier = 0.55;
        },
        onLeave() {
          if (lenis) lenis.options.wheelMultiplier = 1.2;
        },
        onLeaveBack() {
          if (lenis) lenis.options.wheelMultiplier = 1.2;
        },
      });

      /* Kick a synchronous baseline draw so the canvas is non-empty
         BEFORE the first RAF tick. This is what gets captured in
         Playwright responsive sweeps (which disable RAF-driven motion
         via `animations: "disabled"` on screenshot). */
      drawPixelated(0);
      updateChipRail(0);

      /* Run a steady render loop while the section is even close to
         the viewport — independent of scroll velocity. This is what
         keeps the pixels "alive" (flip seed re-randomizes each frame)
         even when the user pauses mid-scroll. */
      function loop() {
        const p = progressRef.current;
        drawPixelated(p);
        updateChipRail(p);
        frameRef.current = requestAnimationFrame(loop);
      }
      frameRef.current = requestAnimationFrame(loop);

      return () => {
        trigger.kill();
        if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
        /* Defensive restore — if the user navigates away mid-pin or
           HMR re-runs this effect, leave the global wheel multiplier
           back at its default so other pages don't inherit our slow
           setting. */
        if (lenis) lenis.options.wheelMultiplier = 1.2;
      };
    },
    { scope: sectionRef, dependencies: [mounted, lenis] },
  );

  /* Refresh ScrollTrigger after shader hydration so the pin range
     recalculates against the final layout height. */
  useEffect(() => {
    if (mounted) {
      ScrollTrigger.refresh();
    }
  }, [mounted]);

  const phaseText = PHASE_TEXTS[phase]!;

  return (
    <section
      ref={sectionRef}
      className="relative bg-background text-foreground"
      style={{
        /* Section runway: 540svh. Morph occupies progress 0→0.50
           (≈270svh), the split + fade occupies 0.50→0.62 (≈65svh),
           and the carousel through 8 industry transitions runs from
           0.62→1.00 (≈205svh ≈ 26svh per item). */
        height: "540svh",
      }}
    >
      <div
        ref={pinRef}
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
      >
        {/* LAYER 0 — Mesh-gradient ambient shader */}
        {mounted ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[0]"
          >
            <MeshGradient
              style={{ width: "100%", height: "100%" }}
              colors={[...WORK_HERO_COLORS]}
              distortion={0.6}
              swirl={0.45}
              grainMixer={0.32}
              grainOverlay={0.16}
              speed={0.32}
              maxPixelCount={1_440_000}
            />
          </div>
        ) : null}

        {/* LAYER 1 — Soft scrim, fades to white at bottom */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 26%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.35) 72%, rgba(255,255,255,0.78) 90%, rgba(255,255,255,1) 100%)",
          }}
        />

        {/* LAYER 2 — Pixelated canvas. Wrapped in `canvasWrapperRef`
            so the chip-rail reveal can slide the whole text block up
            slightly during phase 3 (makes room for the chip cascade
            without colliding with the headline). */}
        <div
          ref={canvasWrapperRef}
          className="absolute inset-0 z-[3] flex items-center justify-center pointer-events-none"
          style={{ willChange: "transform" }}
        >
          <canvas
            ref={visibleCanvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            aria-hidden
            className="block w-full max-w-[1440px] h-auto px-6 sm:px-8 lg:px-14 xl:px-20"
            style={{
              imageRendering: "pixelated",
            }}
          />
        </div>

        {/* LAYER 3a — Left half "Nine Industries."
            Starts ANCHORED TO CENTER (right-aligned, ends just left of
            viewport mid). During the split it slides leftward and scales
            down. Right-aligned text so the trailing period stays adjacent
            to "One Team." at the initial frame. Now fully visible on all
            screen sizes (hidden class removed for responsiveness). */}
        <div
          ref={leftHeadlineRef}
          className="absolute right-1/2 top-1/2 z-[4] flex pointer-events-none"
          style={{
            opacity: 0,
            willChange: "opacity, transform",
            transform: "translate3d(0, -50%, 0)",
            transformOrigin: "right center",
          }}
        >
          <span
            className="font-medium leading-[1.0] text-foreground tracking-[-0.04em] whitespace-nowrap text-right"
            style={{
              /* Sized to match the canvas's RENDERED text exactly. The
                 canvas is 2400px internal but displays at the visible
                 canvas's bounding-rect width (≤1440px). domFontSize is
                 `internal_sharedFontSize × (display_width / 2400)`, so
                 the DOM character height matches the canvas character
                 height pixel-perfectly at the swap moment. Falls back
                 to a sensible clamp before fonts measure (pre-mount). */
              fontSize: domFontSize > 0 ? `${domFontSize}px` : "clamp(48px, 7vw, 116px)",
            }}
          >
            Nine Industries.
          </span>
        </div>

        {/* LAYER 3b — Right half "One Team." in italic Instrument
            Serif. Starts ANCHORED TO CENTER (left-aligned, starts just
            right of viewport mid). Slides rightward and scales down.
            Fully responsive on all screen sizes. */}
        <div
          ref={rightHeadlineRef}
          className="absolute left-1/2 top-1/2 z-[4] flex pointer-events-none"
          style={{
            opacity: 0,
            willChange: "opacity, transform",
            transform: "translate3d(0, -50%, 0)",
            transformOrigin: "left center",
          }}
        >
          <span
            className="italic leading-[1.0] tracking-[-0.03em] whitespace-nowrap"
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontWeight: 400,
              /* Same soft-lavender as the canvas accent (#6b5ce7) so
                 swap → DOM keeps the exact colour. Single source of
                 truth is in the canvas-init effect; mirroring it
                 inline here keeps the DOM render in lockstep. */
              color: "#6b5ce7",
              /* Matches the canvas's RENDERED text exactly — see the
                 left-half comment for the math. */
              fontSize: domFontSize > 0 ? `${domFontSize}px` : "clamp(48px, 7vw, 116px)",
            }}
          >
            One Team.
          </span>
        </div>

        {/* LAYER 3c — Center industry stack. The hero's headline,
            transformed: 9 industry names in giant Albert Sans, stacked
            vertically. Has top + bottom linear-gradient fade masks so
            the list feathers into the mesh at the edges (some rows
            sit outside the visible window when there are more than fit).

            Each row carries `data-cursor-disc` and `data-cursor-color`
            attributes so the custom cursor morphs into a coloured
            client badge on hover. */}
        {/* Wrapper is FULL-VIEWPORT — top/bottom both 0 — so the
            inner ul self-centres via flex `items-center`. This avoids
            the `top-1/2 -translate-y-1/2` math (which depends on
            knowing the wrapper's own height upfront, and was placing
            tall content above the viewport top on some breakpoints). */}
        <div
          ref={chipRailRef}
          className="absolute inset-0 z-[4] flex items-center justify-center px-6 sm:px-8 lg:px-14 xl:px-20"
          style={{
            opacity: 0,
            pointerEvents: "none",
            willChange: "opacity",
          }}
        >
          <ul
            tabIndex={0}
            aria-label="Industries served"
            className="industry-stack mx-auto w-full max-w-[640px] flex flex-col items-center gap-3 sm:gap-4 lg:gap-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md"
            style={{
              /* The carousel logic in updateChipRail() translates the
                 entire UL each frame so the centered fractional index
                 sits on the viewport midline. No internal scroll, no
                 mask — items off-center get a distance-based opacity
                 falloff (down to 0.2 at the edges) which gives the
                 same edge-softening for free. */
              willChange: "transform",
            }}
          >
            {INDUSTRIES.map((chip) => {
              const primaryClient = chip.clients[0] ?? chip.label;
              const color = CLIENT_COLORS[primaryClient] ?? "#03020B";
              return (
                <li key={chip.label} className="block w-full text-center" style={{ opacity: 0 }}>
                  <span
                    data-cursor-disc={primaryClient}
                    data-cursor-color={color}
                    className="inline-block font-semibold leading-[1.0] text-foreground tracking-[-0.04em] cursor-none transition-colors duration-200"
                    style={{
                      fontSize: "clamp(26px, 3.8vw, 48px)",
                    }}
                  >
                    {chip.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* SR-only fallback so screen readers + crawlers receive both
            phrases. Visible canvas is aria-hidden because canvas text
            isn't natively accessible. */}
        <span className="sr-only">
          {phaseText.plain}
          {phaseText.accent}
        </span>
        <span className="sr-only">
          Work that ships. Nine Industries. One Team. {INDUSTRIES.map((c) => `${c.label}: ${c.clients.join(", ")}.`).join(" ")}
        </span>
      </div>
    </section>
  );
}

/* Singleton temp canvas for the downsample step. Created lazily so
   the module can be imported on the server without touching DOM. */
let _tempCanvas: HTMLCanvasElement | null = null;
function getTempCanvas(): HTMLCanvasElement {
  if (typeof document === "undefined") {
    /* SSR path — return a stub. drawPixelated is gated by mounted in
       the component so this path should never execute, but TS needs a
       definite return. */
    return {} as HTMLCanvasElement;
  }
  if (!_tempCanvas) {
    _tempCanvas = document.createElement("canvas");
  }
  return _tempCanvas;
}
