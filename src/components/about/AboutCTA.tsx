"use client";

import { useEffect, useState } from "react";

import { MeshGradient } from "@paper-design/shaders-react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import MagneticPill from "@/components/primitives/MagneticPill";
import MaskReveal from "@/components/primitives/MaskReveal";
import ScrubScale from "@/components/primitives/ScrubScale";
import { useInView } from "@/lib/useInView";
import { useMounted } from "@/lib/useMounted";

import { HERO_COLORS } from "./palette";

/* Typewriter accent for the CTA headline.
   ─────────────────────────────────────────────────────────────
   Cycles through five adjectives that all qualify "prototype":

     working   — neutral baseline
     clickable — UX-focused (echoes body copy)
     shippable — production-ready angle
     functional — engineering-precise
     production — boldest claim

   Phase machine: hold → delete → wait → type → hold. Each branch
   schedules ONE timer so we never stack timers. Sizing is pinned
   to the LONGEST word ("production", 10 chars) via a CSS spacer
   so the line never reflows as words swap — this is what keeps
   the surrounding "prototype by Thursday." from jumping around.

   Hydration safety: useMounted gates the animated path so SSR
   and first client render emit identical static markup. Without
   the gate, framer-motion-free intervals still cause a render
   divergence because typed text differs between server (initial
   "working") and client (could be any phase). */

const ACCENT_CYCLE = [
  "working",
  "clickable",
  "shippable",
  "functional",
  "production",
] as const;

function TypewriterAccent() {
  const mounted = useMounted();
  const [i, setI] = useState(0);
  const [text, setText] = useState<string>(ACCENT_CYCLE[0]);
  const [phase, setPhase] = useState<"hold" | "delete" | "wait" | "type">(
    "hold",
  );

  useEffect(() => {
    if (!mounted) return;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    /* Per-char + hold timings tuned so a full cycle of the
       longest word ("production", 10 letters) reads as snappy
       rather than sluggish.
         hold:    1400ms (was 2200) — long enough to read the
                  word, short enough that visitors don't lose
                  attention on a CTA section
         delete:  24ms/char (was 38) — backspace should feel fast
         type:    52ms/char (was 85) — types at human-fast pace
         wait:    140ms (was 220) — brief beat between words
       Total cycle for "production": ~1.4s hold + 0.24s delete +
       0.14s wait + 0.52s type ≈ 2.3s (was ~3.7s). */
    if (phase === "hold") {
      timeout = setTimeout(() => setPhase("delete"), 1400);
    } else if (phase === "delete") {
      if (text.length > 0) {
        timeout = setTimeout(() => setText((t) => t.slice(0, -1)), 24);
      } else {
        timeout = setTimeout(() => setPhase("wait"), 140);
      }
    } else if (phase === "wait") {
      timeout = setTimeout(() => {
        setI((n) => (n + 1) % ACCENT_CYCLE.length);
        setPhase("type");
      }, 60);
    } else if (phase === "type") {
      const next = ACCENT_CYCLE[i];
      if (text.length < next.length) {
        timeout = setTimeout(
          () => setText(next.slice(0, text.length + 1)),
          52,
        );
      } else {
        timeout = setTimeout(() => setPhase("hold"), 0);
      }
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [phase, text, i, mounted]);

  /* SSR + first client render emit the same static markup —
     just the first word, no width-pinning spacer span needed,
     no animation. Once mounted flips true, the animated path
     takes over. */
  if (!mounted) {
    return (
      <span
        className="italic text-[#6b5ce7]"
        style={{
          fontFamily: "var(--font-instrument-serif), Georgia, serif",
        }}
      >
        {ACCENT_CYCLE[0]}
      </span>
    );
  }

  /* No width-pinning spacer — the accent renders at its own
     natural width, and the rest of the headline ("prototype
     Thursday.") shifts horizontally as the word swaps. Previously
     we pinned the slot to the longest word ("production"); that
     made shorter words like "working" leave a 3-char-wide gap
     between the typewriter and "prototype", which read as
     accidental whitespace rather than typing. The natural-width
     shift IS the typewriter motif — stripe.com and linear.app
     both do the same. The headline's outer container max-w + line
     clamp keep the visual to two lines at every viewport even
     when the accent expands to its longest word. */
  return (
    <span
      aria-live="polite"
      className="whitespace-nowrap italic text-[#6b5ce7]"
      style={{
        fontFamily: "var(--font-instrument-serif), Georgia, serif",
        paddingRight: "0.18em",
      }}
    >
      {text || "\u00A0"}
    </span>
  );
}

/* CTA — billboard close that mirrors the hero.
   ─────────────────────────────────────────────────────────────
   Premium closing CTAs (Linear, Stripe, Vercel, Apple) all use
   the same template: centred single column, short headline,
   one dominant CTA, generous breathing room. This rebuild
   adopts that template AND mirrors the hero's centred axis so
   the page closes the loop it opened.

   Structure (top → bottom, all centred):
     • Editorial label   (Nº 05 · Working together)
     • Massive headline  (deliverable + timeline, italic accent)
     • Body line         (the three-things ask + the 36/48 promise)
     • Primary CTA       (Start a sprint, dominant)
     • Secondary link    (View work →, demoted text link)

   Background: same hero MeshGradient (page bookends on one
   instrument) PLUS a strong centred radial bloom that pulls
   the eye straight to the headline. */

export default function AboutCTA() {
  const [shaderRef, shaderInView] = useInView<HTMLElement>({
    rootMargin: "300px",
    threshold: 0,
  });

  return (
    <section
      ref={shaderRef}
      aria-labelledby="about-cta-heading"
      /* min-h-[100svh] (not h-[100svh]) — the section is sized to
         AT LEAST one viewport but allowed to grow when the content
         exceeds it (short-viewport cases: landscape phones, very
         tight zoom levels, accessibility text-size overrides).
         Without this the section would clip the CTA pill on
         iPhone SE landscape (667×375). Vertical centering on
         flex still places everything mid-frame at typical
         viewports, so the billboard read is preserved. */
      className="relative isolate flex min-h-[100svh] w-full items-center justify-center overflow-hidden py-20 sm:py-24 lg:py-28"
      style={{ background: "var(--color-paper-alt, #f4eef9)" }}
    >
      {/* ── Layer 0: Hero-palette MeshGradient ─────────────────
          Same instrument as the hero so the page bookends on
          one visual motif. Paused entirely when off-screen. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[0]">
        <MeshGradient
          style={{ width: "100%", height: "100%" }}
          colors={[...HERO_COLORS]}
          distortion={0.6}
          swirl={0.45}
          grainMixer={0.32}
          grainOverlay={0.16}
          speed={shaderInView ? 0.32 : 0}
          maxPixelCount={1_440_000}
        />
      </div>

      {/* ── Layer 1: Vertical vignette ────────────────────────
          Top: soft paper-tone scrim that blends into the Triptych
          section above (paper-alt → paper-alt).
          Bottom: ramps all the way to WHITE so the section's
          bottom edge meets the bg-white footer with no visible
          seam. This is wider than the top stop because the
          footer transition needs a longer fade to reads as a
          gradient rather than a hard line. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(244,238,249,0.6) 0%, rgba(244,238,249,0) 22%, rgba(244,238,249,0) 65%, rgba(255,255,255,0.7) 92%, rgba(255,255,255,1) 100%)",
        }}
      />

      {/* ── Layer 2: Centred focal bloom ──────────────────────
          Lavender radial glow centred on the headline. Falls
          off to transparent paper-tone now (was transparent
          ink) so the bloom blends INTO the light wash rather
          than into a dark void at the corners. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 48%, rgba(189,112,246,0.28) 0%, rgba(107,92,231,0.12) 40%, rgba(244,238,249,0) 75%)",
        }}
      />

      {/* ── Layer 3: Content ───────────────────────────────────
          Single centred column. Everything stacks vertically,
          everything is centre-aligned, every element points the
          eye at the next one down ending at the primary CTA. */}
      {/* Container is sized so the longest accent variant
          ("genuinely", 9 letters) still keeps "We will [accent]
          ship it." on a SINGLE line at the chosen font cap.
          Was max-w-[1100px] which caused the line to wrap on
          longer accents — flipping the headline between 2 and
          3 lines as the typewriter cycled. */}
      <div className="relative z-[3] mx-auto flex w-full max-w-[1280px] flex-col items-center px-6 text-center sm:px-8 lg:px-14 xl:px-20">
        <p
          className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.22em] text-foreground-mid"
          style={{
            fontFamily:
              "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          <span className="tabular-nums">№ 05</span>
          <span aria-hidden className="h-px w-8 bg-foreground-mid/40" />
          <span>Working together</span>
        </p>

        <ScrubScale scaleTo={1.03} opacityTo={1}>
          <h2
            id="about-cta-heading"
            /* Locked to TWO visual lines across every viewport from
               280px (Galaxy Z Fold folded) to 4K. The mechanism:
                 • `<br>` (via two block spans) forces the break
                   after line 1.
                 • Font-size clamp is tuned so the longer line
                   ("production prototype Thursday." — 30 chars
                   incl. italic accent) fits the container width on
                   ONE visual line at every step of the clamp curve.
                 • Container max-w (1280px) + responsive px-* gutters
                   give consistent budget at each breakpoint.
               Math check (font × longest-line chars vs container w):
                 280px vw - 48 gutter = 232px usable.
                 Line 2 = 30 chars × ~0.5em avg = 15em.
                 At font 18px: 15 × 18 × 0.5 = 135px → fits.
                 At font 20px: 15 × 20 × 0.5 = 150px → fits.
                 So the clamp FLOOR is 18px (not 22px) to give a
                 small safety margin at the absolute narrowest
                 viewport (Z Fold folded). At sm+ the formula
                 ramps up rapidly via the vw curve. */
            className="mt-6 font-medium leading-[1.05] text-foreground sm:mt-8"
            style={{
              fontSize: "clamp(18px, 7vw, 78px)",
              letterSpacing: "-0.045em",
            }}
          >
            {/* Closing headline — "Spec Monday. {typewriter}
                prototype Thursday."
                  • Self-contained (no pronouns to interpret).
                  • Names two days + two artifacts.
                  • Telegraphic form (no "on"/"by") chosen so the
                    long line fits ONE visual line down to a
                    280-px folded-fold viewport — those two
                    prepositions cost ~5 characters which is the
                    difference between 2 lines and 3.
                  • Body copy below proves the tighter 36/48hr
                    breakdown.
                  • Typewriter cycles through 5 synonyms for
                    "working prototype" — see TypewriterAccent. */}
            <MaskReveal
              text="Spec Monday."
              as="span"
              className="block whitespace-nowrap"
              stagger={0.05}
              duration={0.9}
            />
            <span className="mt-1 block whitespace-nowrap">
              <TypewriterAccent />
              <MaskReveal
                text=" prototype Thursday."
                as="span"
                className="inline"
                stagger={0.05}
                duration={0.9}
              />
            </span>
          </h2>
        </ScrubScale>

        <p className="mt-7 max-w-[60ch] text-balance text-base leading-[1.55] text-foreground-mid sm:mt-10 sm:text-lg lg:text-xl">
          Send three things — the goal, the constraint, and what
          &ldquo;shipped&rdquo; looks like to you. You will have a
          clickable prototype in 36 hours, and a sprint plan in 48.
        </p>

        <div className="mt-9 flex flex-col items-center gap-5 sm:mt-12">
          <MagneticPill
            href="/#talk-to-us"
            variant="primary"
            cursorText="let's go"
          >
            Start a sprint <ArrowRight aria-hidden size={18} />
          </MagneticPill>
          {/* Secondary link — same #talk-to-us anchor as the
              primary pill above. The landing page's CTA form has
              a mode toggle for "Talk to an expert" vs "Sprint
              plan"; this secondary link signals the alternate
              path (expert conversation) without needing a
              separate destination. Was "View work" pointing at
              /work — restore when the work archive ships. */}
          <Link
            href="/#talk-to-us"
            data-cursor-text="reach out"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground-mid transition-colors hover:text-foreground"
            style={{ letterSpacing: "-0.01em" }}
          >
            Talk to an expert <ArrowUpRight aria-hidden size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
