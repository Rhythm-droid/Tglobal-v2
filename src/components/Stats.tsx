import type { ReactNode } from "react";

/**
 * Section 2 — "The Result Section".
 * Figma spec: 1440×650 white section, 1280×544 inner container (32px radius),
 * 5 cards in an explicit 3-column grid:
 *
 *   ┌─────────┬────────────┬─────────┐
 *   │         │  Seamless  │   4X    │
 *   │  +270%  ├────────────┤         │
 *   │         │    98%     │         │
 *   │         ├────────────┴─────────┤
 *   │         │     Worldwide        │
 *   └─────────┴──────────────────────┘
 *
 * Responsive strategy:
 *   - lg+ (≥1024): full 3-col grid at Figma spec (390 / 466 / 377)
 *   - md (768–1024): 2-col grid, Worldwide + Seamless full width
 *   - mobile: single-column stack
 */
export default function Stats() {
  return (
    <section
      id="stats"
      className="relative w-full bg-white py-12 lg:py-[53px]"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-20">
        <div className="rounded-[32px] bg-white p-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[390px_minmax(0,1fr)_377px] lg:grid-rows-[auto_auto_auto] min-[1456px]:grid-rows-[auto_auto_98px]">
            {/* +270% — col 1, spans all 3 rows on desktop */}
            <EfficiencyCard className="lg:col-start-1 lg:row-start-1 lg:row-span-3" />

            {/* Seamless Workflow — col 2 row 1 */}
            <IntegrationCard className="lg:col-start-2 lg:row-start-1" />

            {/* 4X — col 3 spans rows 1-2 */}
            <FasterCard className="lg:col-start-3 lg:row-start-1 lg:row-span-2" />

            {/* 98% Satisfaction — col 2 row 2 */}
            <SatisfactionCard className="lg:col-start-2 lg:row-start-2" />

            {/* Worldwide — spans full width on tablet, col 2-3 on desktop */}
            <WorldwideCard className="md:col-span-2 lg:col-start-2 lg:col-span-2 lg:row-start-3" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   Shared big-stat card layout: 80px SemiBold number + title + copy
   ──────────────────────────────────────────────────────────── */
interface BigStatCardProps {
  className?: string;
  stat: string;
  title: string;
  titleWeight?: "medium" | "normal";
  description: string;
  background: string;
  children?: ReactNode; // decorations that sit below content
}

function BigStatCard({
  className = "",
  stat,
  title,
  titleWeight = "medium",
  description,
  background,
  children,
}: BigStatCardProps) {
  return (
    <article
      className={`relative overflow-hidden rounded-[24px] p-6 min-h-[280px] ${className}`}
      style={{ background }}
    >
      {children}
      <div className="relative z-10 flex h-full flex-col justify-between gap-6">
        <h3 className="font-semibold text-[64px] leading-[64px] tracking-[-0.02em] text-[color:var(--color-foreground)] lg:text-[80px] lg:leading-[80px] lg:tracking-[-1.6px]">
          {stat}
        </h3>
        <div className="flex flex-col gap-2">
          <h4
            className={`text-2xl leading-[38.4px] text-[color:var(--color-foreground)] ${
              titleWeight === "medium" ? "font-medium" : "font-normal"
            }`}
          >
            {title}
          </h4>
          <p className="text-base leading-6 text-[color:var(--color-muted)]">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}

/* ─── Card 1: +270% Efficiency ─── */
function EfficiencyCard({ className = "" }: { className?: string }) {
  return (
    <BigStatCard
      className={`min-h-[360px] lg:min-h-[520px] ${className}`}
      stat="+270%"
      title="Increase in efficiency"
      description="With our AI driven software development process, the efficiency of work increases"
      background="linear-gradient(147deg, #ffffff 0%, #ffeffa 100%)"
    >
      {/* Lavender glow blob — Figma: 199×199, #bd70f6, blur 140px */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[42%] top-[38%] h-[199px] w-[199px] rounded-full bg-[#bd70f6] blur-[140px]"
      />
      {/* Grid-check texture — soft magenta dots */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(rgba(189,112,246,0.25) 1px, transparent 1.5px)",
          backgroundSize: "16px 16px",
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)",
        }}
      />
    </BigStatCard>
  );
}

/* ─── Card 3: 4X Faster ─── */
function FasterCard({ className = "" }: { className?: string }) {
  return (
    <BigStatCard
      className={`min-h-[360px] lg:min-h-[410px] ${className}`}
      stat="4X"
      title="Faster Development Time"
      titleWeight="normal"
      description="With us you can start your business on time."
      background="linear-gradient(217deg, #e9efff 0%, #ffffff 100%)"
    >
      {/* Coral glow blob — Figma: 188×291, #fc5038, rotated -12.96°, blur 130px */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-16 h-[291px] w-[188px] -rotate-[12.96deg] rounded-[94px/145px] bg-[#fc5038] blur-[130px]"
      />
      {/* Grid-dot texture — concentrated top-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(rgba(252,80,56,0.35) 1px, transparent 1.5px)",
          backgroundSize: "14px 14px",
          maskImage:
            "radial-gradient(circle at 85% 15%, #000 0%, rgba(0,0,0,0.3) 50%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(circle at 85% 15%, #000 0%, rgba(0,0,0,0.3) 50%, transparent 80%)",
        }}
      />
    </BigStatCard>
  );
}

/* ─── Card 4: 98% Client Satisfaction ─────────────────────────
   Ground truth from Figma SVG export (467 × 280 frame):
     Card BG    solid #F9FBFE (no gradient), 24px radius
     Rectangle  478 × 290 at (−12, 0), grainy noise pattern @ 80%, Overlay blend
     Ellipse 9  rx=128.5, ry=138.75 (257 × 277.5), center (456.66, 17.80),
                transform rotate(+40.09°), #4B28FF @ 60%, Gaussian layer blur
     Vector     207.46 × 242.03 at (306.54, −15), rounded-square grid with
                1px linear-gradient stroke fading toward bottom-left

   NOTE: Figma's inspector shows rotation as −40.09° and X/Y as (269, −171.11).
   Those are Figma's display conventions — the actual SVG output is
   rotate(+40.09°) around the ellipse's center. Always trust the SVG.

   Responsive: blob and grid anchor to `right: -N px` so they glue to the
   card's top-right at every breakpoint.
   ──────────────────────────────────────────────────────────── */
function SatisfactionCard({ className = "" }: { className?: string }) {
  return (
    <BigStatCard
      className={className}
      stat="98%"
      title="Client Satisfaction"
      description="Rated 5-stars across all platforms — we deliver exactly what your business needs."
      background="#F9FBFE"
    >
      {/* ── LAYER 1 — Ellipse 9: purple bloom ───────────────────────────
          Figma SVG: cx=456.66, cy=17.80, rx=128.50, ry=138.75,
          transform=rotate(+40.092°), fill=#4B28FF, <g opacity="0.6">,
          blur filter stdDeviation=130.
          CONVERSION RULE: Figma "Layer blur N" exports as stdDeviation=N/2.
          CSS `filter: blur()` uses σ directly, so CSS blur = Figma UI ÷ 2.
          Anchored via `right: -118.82px` so blob glues to card right at every breakpoint. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full bg-[#4B28FF] opacity-100"
        style={{
          right: "-118.82px",
          top: "-120.95px",
          width: "256.99px",
          height: "277.51px",
          transform: "rotate(40.09deg)",
          filter: "blur(130px)",
        }}
      />
      {/* ── LAYER 2 — Pattern noise (Figma: <rect x=-12 width=478 height=290
          fill="url(#pattern0)" fill-opacity=0.8>). Overlay blend @ 80%.
          Figma uses a pre-rendered high-contrast 2000×2000 image pattern;
          we approximate with fractalNoise + CONTRAST BOOST via feComponentTransfer
          (slope 3, intercept -1 → pushes midtones toward black/white) so the
          overlay blend has real dark/light values to work with. Without the
          contrast boost, mid-gray turbulence ≈ 0.5 luminance → overlay blend
          returns source unchanged → grain invisible.
          Rendered BEFORE the grid so strokes sit on top of grain. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-3 top-0 h-[290px] w-[478px] mix-blend-overlay"
        style={{
          opacity: 0.9,
          backgroundImage:
            "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n1' x='0' y='0' width='100%25' height='100%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='7828' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='linear' slope='2.2' intercept='-0.6'/%3E%3CfeFuncG type='linear' slope='2.2' intercept='-0.6'/%3E%3CfeFuncB type='linear' slope='2.2' intercept='-0.6'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n1)'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
          backgroundRepeat: "repeat",
        }}
      />
      {/* ── LAYER 3 — Vector grid (SINGLE LAYER matching Figma exactly).
          Figma SVG: 207.46 × 242.03 rounded-square grid at (306.54, −15),
          stroke="url(#paint0_linear)", stroke-width=1 (shown as 0.5 in viewBox units).
          Linear gradient stroke:
            stop 0: white @ 72% alpha at (507.691, −20.867)
            stop 1: white @  0% alpha at (351.793, 151.387)
          Gradient vector = (−155.9, 172.3) → CSS angle ≈ 222° (toward bottom-left).
          Implementation: stroke alpha fixed at 0.72 (matches stop 0), and a
          linear-gradient mask at 222° fades to transparent — their product
          reproduces the Figma stroke alpha at every point. NO filter blur: Figma's
          only "fade" comes from the gradient alpha, not a Gaussian blur. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          right: "-47.66px",     // 466.34 − (306.54 + 207.46)
          top: "-15px",
          width: "207.46px",
          height: "242.03px",
          backgroundImage:
            "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='35' height='35'%3E%3Crect x='0.5' y='0.5' width='34' height='34' rx='5' ry='5' fill='none' stroke='rgba(255,255,255,0.72)' stroke-width='1'/%3E%3C/svg%3E\")",
          backgroundSize: "34.58px 34.58px",
          backgroundRepeat: "repeat",
          // Linear mask at 222°: opaque at upper-right corner, transparent at
          // ~75% of the gradient line (Figma's gradient ends at 73% of the
          // grid's diagonal length, so 75% is a near-exact match).
          maskImage:
            "linear-gradient(222deg, rgba(0,0,0,1) 0%, transparent 75%)",
          WebkitMaskImage:
            "linear-gradient(222deg, rgba(0,0,0,1) 0%, transparent 75%)",
        }}
      />
      {/* ── LAYER 4 — Binary white DUST (Figma filter0_n card-level noise effect).
          feTurbulence → luminanceToAlpha → feFuncA discrete (51 ones + 49 zeros,
          binary threshold matching Figma's exact tableValues) → feFlood white @ 25%.
          In Figma this is applied as a filter on the whole card <g>, so the dust
          must paint ON TOP of every layer INCLUDING text — that's what gives the
          speckled look on the "98%" numeral. `z-20` puts it above BigStatCard's
          `z-10` text content. Higher baseFrequency for visibly finer grain. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          opacity: 0.28,   // Figma spec is 0.25; nudged up slightly because our turbulence is softer than Figma's 2000×2000 image
          backgroundImage:
            "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='d'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='7828' stitchTiles='stitch'/%3E%3CfeColorMatrix type='luminanceToAlpha'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0'/%3E%3C/feComponentTransfer%3E%3CfeColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23d)'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
          backgroundRepeat: "repeat",
        }}
      />
    </BigStatCard>
  );
}

/* ────────────────────────────────────────────────────────────
   Card 2: Seamless Workflow Integration (white + icon stack)
   Figma spec:
     - Text block: 290.34 × 78 (heading 32px + 4px gap + 2×21px description)
     - Icons cluster: 104 × 40 → 3 × 40 icons with −8px overlap (−space-x-2)
     - Each icon SVG already has 1px inside stroke #E1E2E6 baked in
     - Stack order matches Figma convention: rightmost on top (default flex paint order)
   ──────────────────────────────────────────────────────────── */
function IntegrationCard({ className = "" }: { className?: string }) {
  return (
    <article
      className={`relative rounded-[24px] border border-[color:var(--color-border)] bg-white px-6 py-5 ${className}`}
    >
      <div className="flex items-center gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h4 className="font-medium text-xl leading-[32px] text-[color:var(--color-foreground)]">
            Seamless Workflow Integration
          </h4>
          <p className="text-sm leading-[21px] text-[color:var(--color-muted)]">
            From Design to Delivery — we keep things clean, fast, and collaborative.
          </p>
        </div>
        <div className="inline-flex h-10 w-[104px] shrink-0 items-center -space-x-2">
          {INTEGRATION_ICONS.map((icon) => (
            <img
              key={icon.src}
              src={icon.src}
              alt={icon.alt}
              width={40}
              height={40}
              className="relative h-10 w-10 shrink-0"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </article>
  );
}

const INTEGRATION_ICONS = [
  // Original SVGs — each has the white rounded pill + #E1E2E6 stroke baked
  // into the 40×40 viewBox. Do NOT re-bake to raster: stripping the SVG
  // wrapper removes the pill and makes the logos render oversized.
  { src: "/integrations/1.svg", alt: "Google" },
  { src: "/integrations/2.svg", alt: "Figma" },
  { src: "/integrations/3.svg", alt: "AWS" },
] as const;

/* ────────────────────────────────────────────────────────────
   Card 5: Worldwide Development (flag cluster)
   Figma spec:
     - Text area: 500.64 × 57 (heading 32px leading + 4px gap + 21px leading)
     - Flag cluster: 286 × 48, 4px padding, 32px radius, #FFFBF4 fill, 0.5px stroke
     - 8 circular flags at 40×40 overlapping 6px (278px inner width = 8·40 − 7·6)
   ──────────────────────────────────────────────────────────── */
function WorldwideCard({ className = "" }: { className?: string }) {
  return (
    <article
      className={`relative rounded-[24px] border border-[color:var(--color-border)] bg-white px-6 py-5 ${className}`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-1 min-[1456px]:h-[57px] min-[1456px]:max-w-[500.64px]">
          <h4 className="font-medium text-xl leading-[32px] text-[color:var(--color-foreground)]">
            Worldwide development
          </h4>
          <p className="text-sm leading-[21px] text-[color:var(--color-muted)] min-[1456px]:whitespace-nowrap">
            We collaborate with startups and businesses across the US, Europe, and Asia.
          </p>
        </div>
        <div className="inline-flex h-12 w-[286px] shrink-0 items-center self-start rounded-[32px] border-[0.5px] border-[color:var(--color-border)] bg-[#fffbf4] p-1 md:self-auto">
          <div className="inline-flex items-center -space-x-1.5">
            {FLAGS.map((flag) => (
              <span
                key={flag.src}
                className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-[#fffbf4]"
              >
                <img
                  src={flag.src}
                  alt={flag.alt}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

const FLAGS = [
  { src: "/flags/1.svg", alt: "United States" },
  { src: "/flags/2.svg", alt: "England" },
  { src: "/flags/3.svg", alt: "United Kingdom" },
  { src: "/flags/4.svg", alt: "Canada" },
  { src: "/flags/5.svg", alt: "South Africa" },
  { src: "/flags/6.svg", alt: "Brazil" },
  { src: "/flags/7.svg", alt: "Germany" },
  { src: "/flags/8.svg", alt: "Bangladesh" },
] as const;

