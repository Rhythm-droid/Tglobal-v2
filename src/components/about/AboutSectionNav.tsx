"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* AboutSectionNav — sticky vertical dot rail for the /about page.
   ─────────────────────────────────────────────────────────────
   11 dots, one per section. Active dot fills with --color-primary.
   Clicking a dot smooth-scrolls via Lenis. On hover, a mono label
   appears via CSS ::after pseudo-element (no tooltip library).

   Visibility:
     • Hidden until user scrolls past the hero (first 100vh).
     • Fades out at the CTA (last section).
     • Hidden on mobile (<1024px) via CSS.

   Dark context:
     • When the triptych section is in view, the nav switches to
       light dots via a `.dark-context` class toggle.

   References: Apple product pages, Stripe Annual Letter. */

interface SectionDef {
  readonly id: string;
  readonly label: string;
  readonly dark?: boolean;
}

/* `dark: true` switches the hover-label colour to white/65. The
   dots themselves stay visible on ANY background via
   `mix-blend-mode: difference` in globals.css — so missing this
   flag on a future dark section only affects the hover label, not
   dot visibility. When the about page was reskinned to the light
   lavender wash end-to-end, the Triptych and CTA flipped from
   dark ink → light paper-alt, so neither needs the dark-context
   label colour anymore. Order also reorders to match the new
   page flow: Hero → Team → Work → Triptych → CTA. */
const SECTIONS: readonly SectionDef[] = [
  { id: "about-hero", label: "Opening" },
  { id: "about-team", label: "Team" },
  { id: "about-work", label: "Work" },
  { id: "about-triptych", label: "Triptych" },
  { id: "about-cta", label: "CTA" },
];

export default function AboutSectionNav() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [darkContext, setDarkContext] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const entries = new Map<string, boolean>();

    observerRef.current = new IntersectionObserver(
      (observedEntries) => {
        for (const entry of observedEntries) {
          entries.set(entry.target.id, entry.isIntersecting);
        }

        // Find the first visible section from top
        const firstVisible = SECTIONS.findIndex((s) => entries.get(s.id));
        if (firstVisible >= 0) {
          setActiveIdx(firstVisible);
          setDarkContext(SECTIONS[firstVisible].dark === true);
        }

        // Visibility: show after scrolling past hero
        const heroEl = document.getElementById(SECTIONS[0].id);
        if (heroEl) {
          const heroRect = heroEl.getBoundingClientRect();
          setVisible(heroRect.bottom < window.innerHeight * 0.3);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );

    for (const section of SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    // Use Lenis if available for smooth scroll, otherwise native
    const lenis = (window as unknown as { lenis?: { scrollTo: (el: HTMLElement, opts?: Record<string, unknown>) => void } }).lenis;
    if (lenis) {
      lenis.scrollTo(el, { offset: 0, duration: 1.2 });
    } else {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <nav
      aria-label="Page sections"
      className={`section-nav ${visible ? "visible" : ""} ${darkContext ? "dark-context" : ""}`}
    >
      {SECTIONS.map((section, i) => (
        <button
          key={section.id}
          type="button"
          aria-label={`Scroll to ${section.label}`}
          data-label={section.label}
          className={`section-nav-dot ${activeIdx === i ? "active" : ""}`}
          onClick={() => scrollTo(section.id)}
        />
      ))}
    </nav>
  );
}
