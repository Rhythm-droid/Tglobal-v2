import type { Metadata } from "next";

import AboutCTA from "@/components/about/AboutCTA";
import AboutHero from "@/components/about/AboutHero";
import AboutSectionNav from "@/components/about/AboutSectionNav";
import AboutTeam from "@/components/about/AboutTeam";
import AboutTriptych from "@/components/about/AboutTriptych";
import AboutWorkStrip from "@/components/about/AboutWorkStrip";
import FilmGrain from "@/components/about/FilmGrain";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { ScrollProgress } from "@/components/primitives";

export const metadata: Metadata = {
  title: "About",
  description:
    "The operating model behind TGlobal: fixed-cost sprints, AI-native engineering, human judgment, and production ownership.",
  alternates: { canonical: "https://tglobal.in/about" },
  openGraph: {
    title: "About · TGlobal",
    description:
      "Fixed-cost sprints, AI-native engineering, human judgment, and production ownership.",
    url: "https://tglobal.in/about",
  },
};

/* /about — five-beat editorial.
   ─────────────────────────────────────────────────────────────
   Trimmed from a nine-beat magazine spread to the five sections
   that each say something the previous one didn't:

     01 Opening      — pinned canvas. Hero copy fades, the manifesto
                       materialises at viewport centre, travels to the
                       left rail, three principles cycle on the right
                       via scramble swap. Ends with a lavender wash
                       that hands off seamlessly to the next section.
     02 Team         — Liquid-Metal portraits + mask-reveal names.
                       Faces behind the studio's "small senior team"
                       promise. Placed early so visitors meet the
                       humans before the proof points.
     03 Triptych     — Ship / Taste / Own as cinematic full-bleed
                       frames. Restates the manifesto principles
                       visually — the page's tonal inhale.
     04 Work         — three live case studies. The page's social
                       proof, landing AFTER the team intro so the
                       names attached to the work are already known.
     05 CTA          — final call to start a sprint.

   Removed in the cut: Marquee (decoration recycling manifesto
   phrases), Operating Model (long-form restatement of manifesto
   principle №2), Sprint Engine (duplicated /process page), Standards
   (count-up stats not backed by hard numbers), the founder-letter
   draft, and the particle-break experiments. Their files were
   deleted with the section cut; the lean version loads ~700 fewer
   lines of TSX and the page reads tighter.

   Top-of-page scaffolding:
     • ScrollProgress  — 3px brand-purple bar at viewport top.
     • CustomCursor    — site-wide three-state cursor (dot / ring /
                         pill-with-label) for desktop pointer users.
     • AboutSectionNav — sticky vertical dot rail (desktop only).
     • FilmGrain       — global SVG feTurbulence texture overlay.

   Performance:
     • The opening stage runs a single pinned GSAP ScrollTrigger;
       the timeline fades the hero copy, reveals the manifesto, and
       fades to lavender by the moment the pin releases. No external
       transition zone is needed because the pin's last frame IS the
       handoff colour.
     • Shader / particle canvases pause their rAF loop when their
       section is off-screen via IntersectionObserver (useInView).
     • maxPixelCount caps each shader at ~1.4M pixels. */

export default function AboutPage() {
  return (
    <>
      <ScrollProgress />
      <AboutSectionNav />
      <FilmGrain />

      <Navbar theme="dark" />
      <main id="main-content" tabIndex={-1} className="flex-1 bg-background text-foreground">
        {/* 01 — Opening: hero + manifesto live in one pinned canvas
            so the background never changes between them. The pin's
            exit-wash repaints the viewport to the next section's
            lavender — no gradient strip needed. */}
        <div id="about-hero">
          <AboutHero />
        </div>

        {/* 02 — Work */}
        <div id="about-work">
          <AboutWorkStrip />
        </div>

        {/* 03 — Triptych */}
        <div id="about-triptych">
          <AboutTriptych />
        </div>

        {/* 04 — Team */}
        <div id="about-team">
          <AboutTeam />
        </div>

        {/* 05 — CTA */}
        <div id="about-cta">
          <AboutCTA />
        </div>
      </main>
      <Footer />
    </>
  );
}
