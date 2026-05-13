"use client";

import type { ReactNode } from "react";
import { useState, useRef } from "react";

import ErrorTile from "./ErrorTile";

import { AnimatedGradient } from "@/components/ui/animated-gradient";
import { AuthModal } from "@/components/ui/auth-modal";
import { BorderBeam } from "@/components/ui/border-beam";
import { CircuitPattern } from "@/components/ui/circuit-board";
import { ClosingPlasma } from "@/components/ui/closing-plasma";
import { CommandMenu } from "@/components/ui/command-menu";
import { CursorDrivenParticleTypography } from "@/components/ui/cursor-driven-particle-typography";
import { DitherGradient } from "@/components/ui/dither-gradient";
import { EyeTracking } from "@/components/ui/eye-tracking";
import { FlightStatusCard } from "@/components/ui/flight-status-card";
import HeroGeometric from "@/components/ui/hero-geometric";
import { HyperText } from "@/components/ui/hyper-text";
import { InfiniteImageField } from "@/components/ui/infinite-image-field";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { LayeredStack } from "@/components/ui/layered-stack";
import { LetterCascade } from "@/components/ui/letter-cascade";
import { LiquidBlob } from "@/components/ui/liquid-blob";
import { MacKeyboard } from "@/components/ui/mac-keyboard";
import { MagnetLines } from "@/components/ui/magnet-lines";
import { MagneticDock } from "@/components/ui/magnetic-dock";
import { MatrixRain } from "@/components/ui/matrix-rain";
import { MusicPlayer } from "@/components/ui/music-player";
import { NoiseTexture } from "@/components/ui/noise-texture";
import { ParticleGalaxy } from "@/components/ui/particle-galaxy";
import { PixelCanvas } from "@/components/ui/pixel-canvas";
import { PulsatingButton } from "@/components/ui/pulsating-button";
import { ScrollBasedVelocity } from "@/components/ui/scroll-based-velocity";
import { ScrubInput } from "@/components/ui/scrub-input";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { ShowcaseCard } from "@/components/ui/showcase-card";
import { Signature } from "@/components/ui/signature";
import { SplitFlapDisplay } from "@/components/ui/split-flap-display";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { TestimonialMarquee } from "@/components/ui/testimonial-marquee";
import { TextAnimate } from "@/components/ui/text-animate";
import { TextRepel } from "@/components/ui/text-repel";
import { WebGLLiquid } from "@/components/ui/webgl-liquid";

/* /componentry-preview — visual catalog for picking components.
   ─────────────────────────────────────────────────────────────
   Tiles every Componentry component at preview size so we can
   judge fit for /about Triptych, /work cards, hero alternatives,
   etc. Throw-away page — delete the whole route + the unused
   components before merging anything else to staging.

   Components requiring complex props (image-ripple-effect,
   scroll-choreography, scroll-split-card, sticky-scroll-cards,
   image-trail) are excluded — they need real data/refs and don't
   render meaningfully as standalone tiles.

   `noindex` so this doesn't leak into search engine results
   if someone accidentally pushes the branch. */

export const dynamic = "force-dynamic";

interface TileProps {
  name: string;
  slug: string;
  tags: readonly string[];
  /** Hint about what context this might suit on the TGlobal site. */
  hint?: string;
  children: ReactNode;
  /** Tile background — "dark" or "light". Some components need a
      dark backdrop to read; defaults to light. */
  bg?: "dark" | "light";
}

function Tile({ name, slug, tags, hint, children, bg = "light" }: TileProps) {
  const isDark = bg === "dark";
  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-2xl border ${
        isDark ? "border-white/10 bg-[#0a0612]" : "border-foreground/10 bg-white"
      }`}
    >
      <div
        className="relative flex h-[260px] w-full items-center justify-center overflow-hidden"
        /* `contain: strict` tells the browser this box is sized
           independently of its descendants. Several Componentry
           components (Hero Geometric, WebGL Liquid, Collection
           Surfer) use `min-h-screen` internally which would push
           the article's bounding box to 1000+ px or worse without
           this. With strict containment plus overflow-hidden, the
           descendant DOM can be any size; only the 260×<width>
           viewport is rendered. */
        style={{ contain: "strict" }}
      >
        <ErrorTile>{children}</ErrorTile>
      </div>
      <div
        className={`flex flex-col gap-2 border-t px-5 py-4 ${
          isDark
            ? "border-white/10 text-white"
            : "border-foreground/10 text-foreground"
        }`}
      >
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-base font-medium tracking-tight">{name}</h3>
          <span
            className="font-mono text-[10px] tracking-[0.18em] opacity-55"
            style={{ fontFamily: "var(--font-mono), monospace" }}
          >
            {slug}
          </span>
        </div>
        {hint ? (
          <p className={`text-[13px] leading-snug ${isDark ? "text-white/65" : "text-foreground/65"}`}>
            {hint}
          </p>
        ) : null}
        <div className="mt-1 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${
                isDark ? "bg-white/10 text-white/70" : "bg-foreground/8 text-foreground/65"
              }`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function SectionHeading({ children, count }: { children: ReactNode; count: number }) {
  return (
    <h2
      className="mb-6 mt-16 flex items-baseline gap-3 text-xs font-mono uppercase tracking-[0.22em] text-foreground/65"
      style={{ fontFamily: "var(--font-mono), monospace" }}
    >
      <span>{children}</span>
      <span className="text-foreground/35">/{count}</span>
    </h2>
  );
}

/* Inline SVG placeholders — CSP blocks external `https:` image
   hosts but allows `data:` URIs (whitelisted in the project's CSP).
   Three subtly different colour blocks so card variants read as
   distinct images, not the same swatch repeated. */
const SVG_PLACEHOLDERS = [
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%234B28FF'/><circle cx='200' cy='150' r='60' fill='%237D5CFF' opacity='0.7'/></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%230E0A1E'/><circle cx='200' cy='150' r='80' fill='%23C5BAFF' opacity='0.4'/></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23F4EEF9'/><circle cx='200' cy='150' r='70' fill='%234B28FF' opacity='0.3'/></svg>",
];
const DEMO_IMAGES = SVG_PLACEHOLDERS;

const DEMO_TESTIMONIALS = [
  {
    name: "Anjali Rao",
    text: "Sprint moved from months to days.",
    avatar: SVG_PLACEHOLDERS[0],
    role: "VP Engineering",
    username: "@anjali",
  },
  {
    name: "Marc Chen",
    text: "Cleanest handoff we've had.",
    avatar: SVG_PLACEHOLDERS[1],
    role: "CTO",
    username: "@marc",
  },
  {
    name: "Priya Shah",
    text: "AI-native, but the bar is human.",
    avatar: SVG_PLACEHOLDERS[2],
    role: "Founder",
    username: "@priya",
  },
];

const DEMO_DOCK_ITEMS = [
  { id: "home", icon: "🏠", label: "Home", href: "#" },
  { id: "search", icon: "🔍", label: "Search", href: "#" },
  { id: "files", icon: "📁", label: "Files", href: "#" },
  { id: "mail", icon: "✉️", label: "Mail", href: "#" },
];

const DEMO_COMMAND_GROUPS = [
  {
    title: "Pages",
    items: [
      { id: "home", title: "Home" },
      { id: "work", title: "Work" },
      { id: "about", title: "About" },
    ],
  },
];

function CardScaffold({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-[280px] px-6 text-center text-foreground">
      {children}
    </div>
  );
}

export default function ComponentryPreviewPage() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const pointerRef = useRef<HTMLDivElement | null>(null);

  return (
    <main className="min-h-screen bg-[#fbf8f1] px-6 py-12 sm:px-10 lg:px-16">
      <header className="mb-8">
        <p
          className="text-xs font-mono uppercase tracking-[0.22em] text-foreground/60"
          style={{ fontFamily: "var(--font-mono), monospace" }}
        >
          /componentry-preview · experiment
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          Componentry — visual catalog
        </h1>
        <p className="mt-3 max-w-prose text-sm text-foreground/65">
          Every component from the @componentry registry rendered at preview
          size. Pick winners for /about Triptych, hero variants, card surfaces.
          Tiles that fail to render may need specific props or browser support.
        </p>
      </header>

      {/* ── Atmospheric backgrounds ───────────────────────────────── */}
      <SectionHeading count={7}>Atmospheric backgrounds</SectionHeading>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Tile name="Animated Gradient" slug="animated-gradient" tags={["bg", "shader"]} hint="Smooth mesh-like gradient blends. Hero bg / section backdrop." bg="dark">
          <AnimatedGradient />
        </Tile>
        <Tile name="Closing Plasma" slug="closing-plasma" tags={["bg", "shader"]} hint="WebGL plasma — energetic, fluid. Bold hero alternative." bg="dark">
          <ClosingPlasma />
        </Tile>
        <Tile name="Dither Gradient" slug="dither-gradient" tags={["bg", "shader", "retro"]} hint="Dithered colour transition — game/retro feel." bg="dark">
          <DitherGradient />
        </Tile>
        <Tile name="Hero Geometric" slug="hero-geometric" tags={["bg", "geometric"]} hint="Animated geometric shapes — clean, structured." bg="dark">
          <HeroGeometric />
        </Tile>
        <Tile name="Liquid Blob" slug="liquid-blob" tags={["bg", "shader"]} hint="Organic blob shapes. Hero accent layer.">
          <LiquidBlob />
        </Tile>
        <Tile name="Noise Texture" slug="noise-texture" tags={["bg", "texture"]} hint="Subtle SVG/canvas grain. Layer-on for any surface.">
          <NoiseTexture />
        </Tile>
        <Tile name="WebGL Liquid" slug="webgl-liquid" tags={["bg", "shader", "webgl"]} hint="Liquid metal effect. Premium agency move." bg="dark">
          <WebGLLiquid />
        </Tile>
      </div>

      {/* ── Particle / cursor-reactive ────────────────────────────── */}
      <SectionHeading count={5}>Particles & cursor-reactive</SectionHeading>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Tile name="Cursor Particle Typography" slug="cursor-driven-particle-typography" tags={["text", "cursor"]} hint="Letters made of particles, react to cursor. Hero centrepiece." bg="dark">
          <div className="h-full w-full" style={{ color: "#fff" }}>
            <CursorDrivenParticleTypography text="TGlobal" />
          </div>
        </Tile>
        <Tile name="Matrix Rain" slug="matrix-rain" tags={["bg", "particles", "retro"]} hint="Falling code rain. AI-native engineering shorthand." bg="dark">
          <MatrixRain />
        </Tile>
        <Tile name="Particle Galaxy" slug="particle-galaxy" tags={["bg", "particles", "webgl"]} hint="3D particle swirl. Hero atmospheric layer." bg="dark">
          <ParticleGalaxy />
        </Tile>
        <Tile name="Pixel Canvas" slug="pixel-canvas" tags={["bg", "interactive"]} hint="Hover-reactive pixel grid. Move your cursor over the tile." bg="dark">
          <div className="relative h-full w-full">
            <PixelCanvas />
            <span
              className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-[0.22em] text-white/40"
              style={{ fontFamily: "var(--font-mono), monospace" }}
            >
              hover here
            </span>
          </div>
        </Tile>
        <Tile name="Eye Tracking" slug="eye-tracking" tags={["interactive", "gimmick"]} hint="Eyes follow cursor. On-brand only if you want playful.">
          <EyeTracking />
        </Tile>
      </div>

      {/* ── Text effects ──────────────────────────────────────────── */}
      <SectionHeading count={7}>Text effects</SectionHeading>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Tile name="Hyper Text" slug="hyper-text" tags={["text", "scramble"]} hint="Letter-scramble reveal — like our existing ScrambleSwap.">
          <CardScaffold>
            <HyperText text="TGlobal" />
          </CardScaffold>
        </Tile>
        <Tile name="Letter Cascade" slug="letter-cascade" tags={["text", "reveal"]} hint="Letters drop into place — kinetic hero headline.">
          <CardScaffold>
            <LetterCascade text="TGlobal" />
          </CardScaffold>
        </Tile>
        <Tile name="Scroll-Based Velocity" slug="scroll-based-velocity" tags={["text", "scroll"]} hint="Text skews/slides with scroll velocity. Editorial accent.">
          <ScrollBasedVelocity text="SOFTWARE WITHOUT FRICTION" />
        </Tile>
        <Tile name="Split-Flap Display" slug="split-flap-display" tags={["text", "retro"]} hint="Train station / airport board feel — stat counters." bg="dark">
          <SplitFlapDisplay
            rows={[
              { label: "SPRINTS", value: "19" },
              { label: "UPTIME", value: "99.9%" },
            ]}
            size="sm"
          />
        </Tile>
        <Tile name="Text Animate" slug="text-animate" tags={["text", "reveal"]} hint="Generic configurable text-in animation.">
          <CardScaffold>
            <TextAnimate>TGlobal sprints.</TextAnimate>
          </CardScaffold>
        </Tile>
        <Tile name="Text Repel" slug="text-repel" tags={["text", "cursor"]} hint="Letters repel from cursor — interactive heading.">
          <CardScaffold>
            <TextRepel text="HOVER ME" />
          </CardScaffold>
        </Tile>
        <Tile name="Signature" slug="signature" tags={["text", "draw"]} hint="Animated hand-drawn signature. Founder letter / sign-off.">
          <CardScaffold>
            <Signature />
          </CardScaffold>
        </Tile>
      </div>

      {/* ── Buttons & micro-interactions ──────────────────────────── */}
      <SectionHeading count={4}>Buttons & micro-interactions</SectionHeading>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Tile name="Border Beam" slug="border-beam" tags={["button", "decoration"]} hint="Light tracing around a border. Wrap any card / button.">
          <div className="relative inline-flex h-12 items-center rounded-full bg-primary px-6 text-white">
            <span>Start a sprint</span>
            <BorderBeam />
          </div>
        </Tile>
        <Tile name="Interactive Hover Button" slug="interactive-hover-button" tags={["button"]} hint="Hover swaps text + icon. Editorial pill alternative.">
          <InteractiveHoverButton>Click me</InteractiveHoverButton>
        </Tile>
        <Tile name="Pulsating Button" slug="pulsating-button" tags={["button"]} hint="Soft outward pulse. Attention without aggression.">
          <PulsatingButton>Start now</PulsatingButton>
        </Tile>
        <Tile name="Shimmer Button" slug="shimmer-button" tags={["button"]} hint="Diagonal shimmer sweep. Premium CTA accent.">
          <ShimmerButton>See the work</ShimmerButton>
        </Tile>
      </div>

      {/* ── Cards & surfaces ──────────────────────────────────────── */}
      <SectionHeading count={4}>Cards & surfaces</SectionHeading>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Tile name="Showcase Card" slug="showcase-card" tags={["card"]} hint="Polished case-study card. Work / portfolio.">
          <ShowcaseCard heading="Skyline" imageUrl={DEMO_IMAGES[0]} />
        </Tile>
        <Tile name="Spotlight Card" slug="spotlight-card" tags={["card", "hover"]} hint="Cursor-tracking spotlight on hover. Pricing / feature cards.">
          <div className="w-full max-w-[260px]">
            <SpotlightCard>
              <p className="text-center text-foreground/85">Hover for the spotlight</p>
            </SpotlightCard>
          </div>
        </Tile>
        <Tile name="Flight Status Card" slug="flight-status-card" tags={["card", "dot-matrix"]} hint="Departure-board card with dot-matrix text. Status pages.">
          <FlightStatusCard />
        </Tile>
        <Tile name="Layered Stack" slug="layered-stack" tags={["card", "stack"]} hint="Click to fan out — drag to rearrange. Case study browser.">
          <LayeredStack>
            <div className="flex h-32 w-44 items-center justify-center rounded-xl bg-primary text-white">Skyline</div>
            <div className="flex h-32 w-44 items-center justify-center rounded-xl bg-foreground text-background">MedCollect</div>
            <div className="flex h-32 w-44 items-center justify-center rounded-xl bg-[#fc5038] text-white">Jijibai</div>
          </LayeredStack>
        </Tile>
      </div>

      {/* ── Marquees, collections, infinite ───────────────────────── */}
      <SectionHeading count={2}>Marquees & collections</SectionHeading>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Tile name="Testimonial Marquee" slug="testimonial-marquee" tags={["marquee"]} hint="Horizontal scrolling testimonials. Client trust strip.">
          <TestimonialMarquee items={DEMO_TESTIMONIALS} />
        </Tile>
        <Tile name="Infinite Image Field" slug="infinite-image-field" tags={["bg", "decoration"]} hint="Endless tiled-image field. Abstract bg layer." bg="dark">
          <InfiniteImageField />
        </Tile>
      </div>

      {/* ── Interactive widgets ───────────────────────────────────── */}
      <SectionHeading count={5}>Interactive widgets</SectionHeading>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Tile name="Magnet Lines" slug="magnet-lines" tags={["interactive"]} hint="Lines snap to cursor. Background flair." bg="dark">
          <MagnetLines />
        </Tile>
        <Tile name="Magnetic Dock" slug="magnetic-dock" tags={["nav"]} hint="MacOS-style dock. Nav alternative.">
          <MagneticDock items={DEMO_DOCK_ITEMS} />
        </Tile>
        <Tile name="Circuit Board" slug="circuit-board" tags={["bg", "decoration", "tech"]} hint="Animated circuit traces. Engineering theme." bg="dark">
          <CircuitPattern pattern="data-flow" width={400} height={240} variant="dark" />
        </Tile>
        <Tile name="Scrub Input" slug="scrub-input" tags={["input"]} hint="Drag-to-change number input. App utility.">
          <ScrubInput label="Sprints" />
        </Tile>
        <Tile name="Mac Keyboard" slug="mac-keyboard" tags={["widget"]} hint="On-screen keyboard. Demo / shortcut display.">
          <MacKeyboard />
        </Tile>
      </div>

      {/* ── Modal-triggered ───────────────────────────────────────── */}
      <SectionHeading count={2}>Modal triggered</SectionHeading>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Tile name="Auth Modal" slug="auth-modal" tags={["modal"]} hint="Pre-styled auth modal. Open via button.">
          <div className="flex flex-col items-center gap-3">
            <AuthModal triggerText="Open Auth Modal" />
          </div>
        </Tile>
        <Tile name="Command Menu" slug="command-menu" tags={["modal", "nav"]} hint="⌘K command palette. App-wide search/nav.">
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="rounded-full bg-foreground px-5 py-2 text-sm text-background"
            >
              Open Command Menu
            </button>
            <CommandMenu open={cmdOpen} onOpenChange={setCmdOpen} groups={DEMO_COMMAND_GROUPS} />
          </div>
        </Tile>
      </div>

      {/* ── Other widgets ─────────────────────────────────────────── */}
      <SectionHeading count={1}>Other</SectionHeading>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Tile name="Music Player" slug="music-player" tags={["widget"]} hint="Inline music player widget. Probably not for /about.">
          <MusicPlayer src="" coverArt="" />
        </Tile>
      </div>

      <div ref={pointerRef} className="hidden" />

      <footer className="mt-20 border-t border-foreground/10 pt-6 text-xs text-foreground/55">
        <p>
          Reminder — throw-away page. After picking favourites, delete
          src/app/componentry-preview/ and the unused components from
          src/components/ui/ before merging anything to staging.
        </p>
      </footer>
    </main>
  );
}
