"use client";

import { useEffect, useRef, useState } from "react";

import { ArrowUpRight } from "lucide-react";
import { Warp } from "@paper-design/shaders-react";

import { AnimateIn, MaskReveal } from "@/components/primitives";

/* Team — editorial founder cards with personal-note flip.
   ─────────────────────────────────────────────────────────────
   Layout:
     • Headline row (col-7) + pull-quote rail (col-5)
     • Asymmetric founder grid: 60% Chandan, 40% Dhruv
     • Open-seat hairline strip below the founders (full-width,
       small, label-only) — reads as "we are deliberately small"
       rather than "we have an empty third tile."

   Each founder card:
     FRONT — full-bleed portrait (Warp shader fallback until real
             photo lands at /public/team/<slug>.jpg), name in mask-
             reveal serif, role + bio in caption block, hairline
             ink stroke draws across the bottom of the name.
     BACK  — handwritten personal-note photographed at
             /public/team/<slug>-note.jpg (or rendered as a fallback
             quote until the photo arrives). Hover/focus to flip.

   Assets to drop in (component does a graceful fallback for each):
     /public/team/chandan.jpg    (1200×1500 portrait, B&W or duotone)
     /public/team/dhruv.jpg      (1200×1500 portrait, same treatment)
     /public/team/chandan-note.jpg  (handwritten 1-line note, dark ink
                                     on warm paper, ~1200×800)
     /public/team/dhruv-note.jpg    (same, in Dhruv's handwriting)
     /public/team/chandan-sig.svg   (signature stroke; optional)
     /public/team/dhruv-sig.svg     (signature stroke; optional)
   The component checks for each and falls through to a designed
   fallback if absent — so the section never looks broken in dev. */

interface Founder {
  readonly slug: string;
  readonly initials: string;
  readonly name: string;
  readonly role: string;
  /* One-sentence anchor — names a SPECIFIC shipped thing, not
     LinkedIn-speak. This is the trust signal. */
  readonly anchor: string;
  /* Longer paragraph — for the back-flip context. Kept short
     enough to fit the back of the card without overflow. */
  readonly bio: string;
  /* Handwritten note shown on hover-flip when no note photo
     exists. One line, signed by initials at the end. */
  readonly note: string;
  /* Direct email so the card's CTA points at the actual founder,
     not a generic info@ — feels personal AND faster. */
  readonly email: string;
  /* Warp shader colour seed used as portrait fallback until a
     real photo is dropped in /public/team/. */
  readonly portraitColors: readonly string[];
}

const FOUNDERS: readonly Founder[] = [
  {
    slug: "chandan",
    initials: "CG",
    name: "Chandan Gupta",
    role: "Co-founder · Forward Deployed Engineer",
    /* Anchor is the slot that actually renders on the card (see
       CaseCard render below — `founder.anchor`, not `founder.bio`).
       We put the long-form bio paragraph here so it's what visitors
       see. The `bio` field below is kept populated for the interface
       contract; if it's ever wired into a "read more" expansion or
       a /team detail page later, having it filled keeps that work
       to a one-line render edit. */
    anchor:
      "Six years building compliance-grade data systems for finance and healthcare clients in the US, Europe, and APAC. Replaces manual fragmentation with a single source of truth, and compresses two-month delivery cycles into four days.",
    bio: "Six years building compliance-grade data systems for finance and healthcare clients in the US, Europe, and APAC. Replaces manual fragmentation with a single source of truth, and compresses two-month delivery cycles into four days.",
    note: "I review what I architect. — CG",
    email: "growth@tglobal.in",
    portraitColors: ["#4b28ff", "#7d5cff", "#bd70f6", "#e7dffd", "#fbf8f1"],
  },
  {
    slug: "dhruv",
    initials: "DG",
    name: "Dhruv Gupta",
    role: "Co-founder · Technical Project Manager",
    /* Anchor renders on the card. We use the same long-bio
       paragraph treatment as Chandan above so the two founder
       cards read as a matched pair (same sentence rhythm, same
       claim density). The `bio` field below mirrors the anchor
       for the same reason Chandan's does — keeps the contract
       intact for any future "read more" expansion. */
    anchor:
      "Seven years of AI-native engineering execution for enterprise teams. Bridges complex business logic with rapid deployment, and cuts lead times by 8% while raising quality by 10%.",
    bio: "Seven years of AI-native engineering execution for enterprise teams. Bridges complex business logic with rapid deployment, and cuts lead times by 8% while raising quality by 10%.",
    note: "If we said two weeks, it ships in two weeks. — DG",
    email: "growth@tglobal.in",
    portraitColors: ["#1a1233", "#2d1f5e", "#6b5ce7", "#c5baff", "#fbf8f1"],
  },
  {
    slug: "rhythm",
    initials: "RM",
    name: "Rhythm Mittal",
    role: "Full-stack Engineer",
    /* Anchor mirrors the rhythm of the founder bios above
       (Chandan + Dhruv) — "X across Y. [Verb action], and [verb
       action]." — so the three cards read as a coherent set. The
       claims are defensible from the engineer's actual shipped
       work (MERN + Next.js portfolio across six live products). */
    anchor:
      "Full-stack engineer working across modern web stacks. Builds production systems end-to-end on MERN and Next.js, and ships them with the engineer's name attached.",
    bio: "Full-stack engineer working across modern web stacks. Builds production systems end-to-end on MERN and Next.js, and ships them with the engineer's name attached.",
    note: "If I shipped it, I'll debug it at 2am. — RM",
    email: "rhythmmittal19@gmail.com",
    /* Cool-tone palette to match the other two founder cards.
       Warm orange (the previous seed) broke the trio's visual
       rhythm and read like an error against the lavender section
       wash. This palette stays in the brand violet/lavender family
       but uses different stop weighting so each card still looks
       individually distinct under the Warp shader. */
    portraitColors: ["#6b5ce7", "#9d8bff", "#c5baff", "#f0eaff", "#fbf8f1"],
  },
];

function useViewportPause<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      /* Fallback for environments without IntersectionObserver
         (e.g. older browsers, JSDOM in tests): assume the element
         is "active" so animations never silently stall. This is the
         intentional inverse of the observer's behaviour. */
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActive(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => setActive(e.isIntersecting)),
      { rootMargin: "150px", threshold: 0 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);
  return { ref, active };
}

/* Build-time registry of which founders have which assets in
   /public/team/. Add an entry to either map when you drop the
   file in — that flips the card from Warp-shader fallback to the
   real photo / note image. Until then we DO NOT issue a request
   for the file, so the dev console stays clean and we save a
   round-trip per founder on every page load even in prod.

   The value is the FILE EXTENSION ("jpg", "png", "webp" …) — that
   way each founder can carry the format that best fits their
   asset (PNGs for crisp edges / alpha, JPGs for photographic
   headshots) without forcing a re-encode just to match the code.

   Previous implementation did a runtime Image() existence-check
   per card — which fired a 404 per founder per page load, polluting
   the dev console with 6+ red errors and costing 6 HEAD requests
   in prod long after real assets were in place. */
const FOUNDERS_PORTRAIT_EXT: Readonly<Record<string, string>> = {
  chandan: "png",
  dhruv: "png",
  // Add slug → ext here when the photo lands in /public/team/<slug>.<ext>
};
const FOUNDERS_NOTE_EXT: Readonly<Record<string, string>> = {
  // Add slug → ext here when the note lands in /public/team/<slug>-note.<ext>
};

function FounderCard({
  founder,
  index,
  emphasis,
}: {
  founder: Founder;
  index: number;
  /* `emphasis="primary"` is the wider 60% card; `"secondary"` is
     the narrower 40% card. Used to scale name + portrait subtly so
     the wider card carries more visual weight. */
  emphasis: "primary" | "secondary";
}) {
  const { ref, active } = useViewportPause<HTMLDivElement>();
  const [flipped, setFlipped] = useState(false);

  /* Photo / note assets are resolved through the registry maps
     above. The map's value is the file extension so each founder
     can ship the right format for their image (e.g. PNG when alpha
     or edge crispness matter, JPG for plain headshots). An entry
     missing from the map = no asset → render the Warp shader
     fallback. */
  const portraitExt = FOUNDERS_PORTRAIT_EXT[founder.slug];
  const noteExt = FOUNDERS_NOTE_EXT[founder.slug];
  const portraitSrc = portraitExt
    ? `/team/${founder.slug}.${portraitExt}`
    : "";
  const noteSrc = noteExt
    ? `/team/${founder.slug}-note.${noteExt}`
    : "";

  const hasPortrait = portraitExt != null;
  const hasNote = noteExt != null;

  const nameSize =
    emphasis === "primary"
      ? "clamp(34px, 3.4vw, 56px)"
      : "clamp(26px, 2.4vw, 40px)";

  return (
    <AnimateIn y={28} delay={index * 0.08}>
      <article
        ref={ref}
        /* Card surface is hairline-bordered with a generous inset.
           Padding INSIDE the card frames the portrait so the photo
           reads as a print mount, not a full-bleed image.
           `data-cursor-text="flip"` makes the custom cursor read
           the card as interactive — without it the cursor falls
           through to its default ring state and the flip behaviour
           reads as "what just happened?" rather than "I made that
           happen." Same opt-in pattern used by MagneticPill. */
        data-cursor-text="flip"
        className="group relative h-full"
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
        onFocus={() => setFlipped(true)}
        onBlur={() => setFlipped(false)}
      >
        {/* 3D flip container. perspective on the wrapper, transform-
            style: preserve-3d on the inner panels. Two absolute-
            positioned faces share the same bounding box; rotateY
            toggles which face is forward. */}
        <div
          className="relative w-full"
          style={{ perspective: "1800px", aspectRatio: "4 / 5" }}
        >
          <div
            className="absolute inset-0 transition-transform duration-700 ease-out"
            style={{
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* ─── FRONT: portrait + name + role ─── */}
            <div
              className="absolute inset-0 overflow-hidden rounded-sm"
              style={{ backfaceVisibility: "hidden" }}
            >
              {/* Photo layer — real photo when present, Warp
                  shader fallback otherwise. The photo uses a slow
                  Ken Burns when in viewport; the Warp drifts at a
                  low speed. Both pause off-screen. */}
              {hasPortrait ? (
                <div
                  className="absolute inset-0 bg-cover bg-center grayscale transition-[filter] duration-700 group-hover:grayscale-0"
                  style={{
                    backgroundImage: `url(${portraitSrc})`,
                    animation: active
                      ? "ken-burns 14s ease-in-out infinite alternate"
                      : "none",
                  }}
                />
              ) : (
                <div className="absolute inset-0 bg-[#0a0612]">
                  <Warp
                    style={{ width: "100%", height: "100%" }}
                    colors={[...founder.portraitColors]}
                    proportion={0.5}
                    softness={0.85}
                    shape="checks"
                    shapeScale={0.4}
                    distortion={0.55}
                    swirl={0.85}
                    swirlIterations={10}
                    scale={0.7}
                    speed={active ? 0.18 : 0}
                    maxPixelCount={400_000}
                  />
                </div>
              )}

              {/* Film-grain overlay so portrait reads as a print
                  scan, not a flat web image. */}
              <div
                aria-hidden
                className="absolute inset-0 mix-blend-overlay opacity-30"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.18 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
                  backgroundSize: "200px 200px",
                }}
              />

              {/* Bookplate gradient + mono initials bottom-left. */}
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1/3"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(10,6,18,0) 0%, rgba(10,6,18,0.85) 100%)",
                }}
              />
              <span
                aria-hidden
                className="absolute bottom-6 left-6 leading-none text-white/85"
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "clamp(14px, 1.05vw, 18px)",
                  letterSpacing: "0.16em",
                }}
              >
                {founder.initials}
              </span>

              {/* "Read note ↗" affordance — hint that this card
                  flips. Floats top-right, low-contrast until hover. */}
              <span
                aria-hidden
                className="absolute right-5 top-5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/55 transition-colors duration-300 group-hover:text-white/85"
                style={{ fontFamily: "var(--font-mono), monospace" }}
              >
                Note <ArrowUpRight size={12} aria-hidden />
              </span>
            </div>

            {/* ─── BACK: handwritten note + email ─── */}
            <div
              className="absolute inset-0 overflow-hidden rounded-sm bg-[var(--color-paper-cream,#fdfaf2)]"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              {/* If a photographed note exists, show it as a full-
                  bleed scan. Otherwise render the note string in
                  Instrument Serif italic on warm paper — looks
                  like a handwritten card. */}
              {hasNote ? (
                <div
                  className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${noteSrc})` }}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                  <p
                    className="text-balance italic text-foreground"
                    style={{
                      fontFamily:
                        "var(--font-instrument-serif), Georgia, serif",
                      fontSize: "clamp(22px, 2.2vw, 34px)",
                      letterSpacing: "-0.01em",
                      lineHeight: 1.25,
                    }}
                  >
                    &ldquo;{founder.note}&rdquo;
                  </p>
                </div>
              )}
              {/* Email CTA pinned bottom-left on the back, so the
                  flip pays off with a direct-action affordance. */}
              <a
                href={`mailto:${founder.email}`}
                data-cursor-text="email"
                className="absolute bottom-6 left-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
                style={{ letterSpacing: "-0.01em" }}
              >
                {founder.email}
                <ArrowUpRight size={14} aria-hidden />
              </a>
            </div>
          </div>
        </div>

        {/* Caption block — sits OUTSIDE the flip plane so it stays
            stable while the photo flips. Name uses MaskReveal +
            an underline that draws in on viewport enter. */}
        <div className="mt-7 border-t border-foreground/15 pt-5">
          <div className="flex items-baseline justify-between gap-4">
            <MaskReveal
              text={founder.name}
              as="h3"
              className="relative font-medium leading-[1.05] text-foreground"
              style={{
                fontSize: nameSize,
                letterSpacing: "-0.025em",
              }}
              stagger={0.04}
              duration={0.7}
            />
            <span
              className="shrink-0 text-foreground/55"
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "11px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              0{index + 1}
            </span>
          </div>
          {/* 1px ink stroke draws in 600ms after name reveal — the
              "signature flourish" promised in the section design.
              CSS-only via the keyframe defined in globals.css
              (.team-name-stroke). */}
          <span
            aria-hidden
            className="team-name-stroke mt-3 block h-px bg-foreground/45"
          />
          <p
            className="mt-4 italic text-foreground-mid"
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontSize: "clamp(15px, 1.05vw, 17px)",
            }}
          >
            {founder.role}
          </p>
          {/* Anchor sentence — the trust signal. Names a SPECIFIC
              shipped thing, not generic experience claims. */}
          <p className="mt-4 text-pretty text-base leading-[1.55] text-foreground-mid">
            {founder.anchor}
          </p>
        </div>
      </article>
    </AnimateIn>
  );
}

export default function AboutTeam() {
  return (
    <section
      aria-labelledby="team-heading"
      className="relative py-28 sm:py-36 lg:py-44"
      style={{ background: "#ffffff" }}
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
        {/* ── Header row: headline (col-7) + pull-quote rail
            (col-5). The right rail used to be 90% empty — now
            it carries a founder pull quote so the section's
            tonal intent ("small senior team, hands on") gets
            stated directly instead of just implied by photos. */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <p className="editorial-label text-foreground-mid">
              <span className="tabular-nums">№ 02</span>
              <span aria-hidden className="h-px w-8 bg-foreground-mid/40" />
              <span>The team on the wall</span>
            </p>
            <MaskReveal
              text="The humans behind the sprints."
              as="h2"
              id="team-heading"
              className="mt-8 max-w-[18ch] text-balance font-medium leading-[1] text-foreground"
              style={{
                fontSize: "clamp(40px, 5.6vw, 92px)",
                letterSpacing: "-0.045em",
              }}
            />
          </div>
          <div className="lg:col-span-5">
            {/* Pull-quote sized smaller than the headline so the
                eye reads headline → photos → quote → bios in
                that hierarchy. Italic Instrument Serif matches
                the manifesto callouts on the hero. */}
            <p
              className="text-balance italic leading-[1.3] text-foreground"
              style={{
                fontFamily: "var(--font-instrument-serif), Georgia, serif",
                fontSize: "clamp(20px, 1.7vw, 26px)",
                letterSpacing: "-0.01em",
              }}
            >
              &ldquo;You hire us, you get us. The names on the
              contract are the people on your keyboard.&rdquo;
            </p>
            <p
              className="mt-4 text-sm text-foreground-mid"
              style={{
                fontFamily: "var(--font-mono), monospace",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontSize: "11px",
              }}
            >
              — The founders
            </p>
          </div>
        </div>

        {/* ── Founder grid: equal-width 3-up row.
            On lg+, each founder takes 4/12 cols (~33%) — equal
            weight across the row, no hierarchy fakery. On md they
            collapse to 2 cards top + 1 card bottom; on mobile
            they stack full-width. */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3 lg:gap-10">
          {FOUNDERS.map((founder, i) => (
            <FounderCard
              key={founder.slug}
              founder={founder}
              index={i}
              emphasis="secondary"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
