"use client";

import { useEffect, useRef, useState } from "react";

import { Warp } from "@paper-design/shaders-react";

import { AnimateIn, MaskReveal } from "@/components/primitives";

/* Team — Liquid-Metal portrait cards.
   ─────────────────────────────────────────────────────────────
   Each card uses a paper-shaders Warp shader at portrait scale as
   the placeholder portrait. Different color seed per person so the
   cards read as four distinct artistic ink portraits, not four
   identical color tiles.

   Names use MaskReveal — the reveal sweeps left-to-right when the
   card enters the viewport, like film credits.

   Hover treatment FLIPS the trope — photos start in COLOR and
   desaturate on hover (every agency does the opposite). The mono
   initials sit bottom-left as a bookplate. The role line sits in
   italic Instrument Serif.

   When real photos arrive: drop them in /public/team/ and set the
   `photo` field per member. The component renders the photo via
   bg-cover + Ken Burns, falling through the Warp portrait below if
   none is provided. */

interface Member {
  readonly initials: string;
  readonly name: string;
  readonly role: string;
  readonly bio: string;
  readonly photo?: string;
  readonly portraitColors: readonly string[];
  /* `placeholder: true` renders an "Open seat / joining soon" card.
     The slot is kept in the lineup so the section page-spread
     stays balanced (3 cards in a row) while we keep the third
     teammate confidential until contracts settle. */
  readonly placeholder?: boolean;
}

/* Photo files: drop high-res portraits at /public/team/<slug>.jpg
   (recommended 1200×1500, JPEG ≤ 250kb, eyes around the top third
   so the bookplate bottom-third gradient doesn't cover them).
   Until the files exist, the Warp shader portrait below renders
   as a placeholder — looks intentional, not broken. */
const MEMBERS: readonly Member[] = [
  {
    initials: "CG",
    name: "Chandan Gupta",
    role: "Co-founder · Forward Deployed Engineer",
    bio: "Six years architecting data systems for US, EU, and APAC clients across finance and healthcare. Specialty: translating compliance-heavy requirements into scalable roadmaps and pulling delivery from months to days.",
    portraitColors: ["#4b28ff", "#7d5cff", "#bd70f6", "#e7dffd", "#fbf8f1"],
  },
  {
    initials: "DG",
    name: "Dhruv Gupta",
    role: "Co-founder · Technical Project Manager",
    bio: "Seven years driving AI-native engineering execution. Bridges business logic and shipping reality so the team always knows what 'done' looks like — and gets there without waste.",
    portraitColors: ["#1a1233", "#2d1f5e", "#6b5ce7", "#c5baff", "#fbf8f1"],
  },
  {
    initials: "—",
    name: "Open seat",
    role: "Joining soon",
    bio: "Reserved for our next teammate. Currently in conversation; details land here once the ink dries.",
    portraitColors: ["#e7dffd", "#f4eef9", "#fbf8f1", "#f5d4cb", "#ffffff"],
    placeholder: true,
  },
];

function useViewportPause<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
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

function MemberCard({ member, index }: { member: Member; index: number }) {
  const { ref, active } = useViewportPause<HTMLDivElement>();
  return (
    <AnimateIn y={28} delay={index * 0.06}>
      <article
        ref={ref}
        /* Placeholder cards opt OUT of the hover desaturation
           and run at slightly reduced opacity so the eye reads
           them as "held space" rather than a 3rd active teammate. */
        className={`group flex flex-col ${member.placeholder ? "opacity-80" : ""}`}
      >
        {/* Portrait — 4:5 ratio. Warp shader at low intensity gives a
            marbled-ink portrait. Each member has a distinct color seed.
            On hover the portrait desaturates (color-to-mono FLIP) —
            except placeholders, which are already neutral. */}
        <div
          className={`relative aspect-[4/5] overflow-hidden rounded-sm transition-[filter] duration-700 ${
            member.placeholder
              ? "bg-[var(--color-paper-cream,#fdfaf2)]"
              : "bg-[#0a0612] group-hover:saturate-[0.35]"
          }`}
        >
          {member.photo ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${member.photo})`,
                animation: active
                  ? "ken-burns 14s ease-in-out infinite alternate"
                  : "none",
              }}
            />
          ) : (
            <div className="absolute inset-0">
              <Warp
                style={{ width: "100%", height: "100%" }}
                colors={[...member.portraitColors]}
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
          {/* Grain overlay — subtle film texture on top of portrait. */}
          <div
            aria-hidden
            className="absolute inset-0 mix-blend-overlay opacity-30"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.18 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
              backgroundSize: "200px 200px",
            }}
          />
          {/* Bookplate — bottom gradient + mono initials.
              Placeholder cards invert to a light gradient + dark
              initials so they read as "draft / held" not as a
              dark active portrait. */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/3"
            style={{
              background: member.placeholder
                ? "linear-gradient(180deg, rgba(253,250,242,0) 0%, rgba(253,250,242,0.92) 100%)"
                : "linear-gradient(180deg, rgba(10,6,18,0) 0%, rgba(10,6,18,0.85) 100%)",
            }}
          />
          <span
            aria-hidden
            className={`absolute bottom-6 left-6 leading-none ${
              member.placeholder ? "text-foreground/55" : "text-white/85"
            }`}
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "clamp(14px, 1.05vw, 18px)",
              letterSpacing: "0.16em",
            }}
          >
            {member.initials}
          </span>
        </div>

        {/* Caption block — name + role + bio. Hairline divider above. */}
        <div className="mt-7 border-t border-foreground/15 pt-5">
          <div className="flex items-baseline justify-between gap-4">
            <MaskReveal
              text={member.name}
              as="h3"
              className="font-medium leading-[1.05] text-foreground"
              style={{
                fontSize: "clamp(24px, 2.05vw, 34px)",
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
          <p
            className="mt-2 italic text-foreground-mid"
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontSize: "clamp(15px, 1.05vw, 17px)",
            }}
          >
            {member.role}
          </p>
          <p className="mt-4 text-pretty text-base leading-[1.55] text-foreground-mid">
            {member.bio}
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
      style={{ background: "var(--color-paper)" }}
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <p className="editorial-label text-foreground-mid">
              <span className="tabular-nums">№ 04</span>
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
          <p className="max-w-[42ch] text-lg leading-[1.55] text-foreground-mid lg:col-span-5 lg:text-xl">
            Small studio, senior bench. Each person owns the work they touch
            and reviews everything that ships.
          </p>
        </div>

        {/* 3-column grid matches the active team size. The third
            slot is a placeholder card (member.placeholder === true)
            so the row stays balanced while we hold space for the
            next teammate. Bump back to lg:grid-cols-4 if the team
            grows past 3. */}
        <div className="mt-20 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
          {MEMBERS.map((member, i) => (
            <MemberCard key={member.name} member={member} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
