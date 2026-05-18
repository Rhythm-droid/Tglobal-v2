"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ProcessSectionNav — sticky vertical dot rail for /process.
   ─────────────────────────────────────────────────────────────
   Same shell as AboutSectionNav. Eight dots, one per section.
   Uses Lenis for smooth scroll if available, falls back to
   native scrollIntoView. Reuses .section-nav and .section-nav-dot
   classes from globals.css. Hidden under 1024px viewport. */

interface SectionDef {
  readonly id: string;
  readonly label: string;
}

const SECTIONS: readonly SectionDef[] = [
  { id: "process-hero", label: "Opening" },
  { id: "process-contrast", label: "Contrast" },
  { id: "process-steps", label: "Five steps" },
  { id: "process-anatomy", label: "Anatomy" },
  { id: "process-triptych", label: "Stack" },
  { id: "process-artifacts", label: "Artifacts" },
  { id: "process-qa", label: "Q&A" },
  { id: "process-cta", label: "CTA" },
];

export default function ProcessSectionNav() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const entries = new Map<string, boolean>();

    observerRef.current = new IntersectionObserver(
      (observedEntries) => {
        for (const entry of observedEntries) {
          entries.set(entry.target.id, entry.isIntersecting);
        }

        const firstVisible = SECTIONS.findIndex((s) => entries.get(s.id));
        if (firstVisible >= 0) {
          setActiveIdx(firstVisible);
        }

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

    const lenis = (
      window as unknown as {
        lenis?: {
          scrollTo: (el: HTMLElement, opts?: Record<string, unknown>) => void;
        };
      }
    ).lenis;
    if (lenis) {
      lenis.scrollTo(el, { offset: 0, duration: 1.2 });
    } else {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <nav
      aria-label="Page sections"
      className={`section-nav ${visible ? "visible" : ""}`}
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
