"use client";

/* ─── /privacy page ──────────────────────────────────────────────
 *
 * Editorial brand-register privacy policy. Belongs to the same
 * visual world as Hero/CTA — same lavender wash, same ambient blur
 * orbs, same display-lg + Instrument Serif italic accent — so users
 * landing here from the footer feel they're still on TGlobal, not
 * thrown into a generic legal subsite.
 *
 * Layout strategy:
 *   • Minimal page header (logo + back link). The marketing Navbar
 *     is absolute-positioned and hero-only by design, so it can't
 *     ride along on inner pages — we'd lose orientation halfway down
 *     a long policy. A small dedicated header solves that.
 *   • Hero: eyebrow → display-lg with italic "why" accent → meta
 *     pill (last updated + version).
 *   • TL;DR: the only card on the page (gradient border, matching
 *     CTA's surface). Per the anti-card design rule, every other
 *     section uses dividers + spacing.
 *   • Two-column on lg: sticky TOC (200px) + content (max-w 65ch).
 *   • Single-column with inline TOC pinned-top on mobile/tablet.
 *
 * Scroll-spy:
 *   IntersectionObserver tracks which section heading sits closest
 *   to the top viewport edge. The matching TOC item picks up the
 *   `aria-current="location"` flag and a primary-coloured indicator.
 *   Lenis (configured globally in SmoothScrollProvider) intercepts
 *   anchor link clicks and animates the scroll, so plain <a href="#x">
 *   gets smooth scrolling for free.
 *
 * A note on dangerouslySetInnerHTML:
 *   Section bodies in content.ts use inline HTML for <strong>, <em>,
 *   <a> formatting. The content is statically authored and committed
 *   in the repo — no user input ever reaches it — so the standard
 *   XSS concern doesn't apply. Using a markdown parser for this small
 *   surface would be over-engineering. */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import LogoMark from "@/components/primitives/LogoMark";
import Footer from "@/components/Footer";
import {
  POLICY_LAST_UPDATED,
  POLICY_VERSION,
  SECTIONS,
  TLDR,
} from "./content";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Format the last-updated date in a long, locale-friendly form
 * ("4 May 2026" rather than "2026-05-04"). Intl.DateTimeFormat
 * handles the locale switch automatically — visiting from de-DE will
 * render "4. Mai 2026". Static at SSR time so SSR/hydration match. */
function formatLastUpdated(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function PrivacyPage() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0]?.id ?? "");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const reduceMotion = useReducedMotion();

  /* IntersectionObserver scroll-spy. We pick the entry whose top is
   * closest to (but past) a 25%-from-top "trigger line" — that puts
   * the active TOC item in sync with what the user is actually
   * reading rather than what's just barely in view. */
  useEffect(() => {
    const SECTION_IDS = SECTIONS.map((s) => s.id);
    /* Track each section's most recent intersection ratio so we can
     * pick the "deepest" one whenever multiple are in view. */
    const ratios = new Map<string, number>();
    SECTION_IDS.forEach((id) => ratios.set(id, 0));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.intersectionRatio);
        }
        /* Pick the visible section nearest the top of the viewport.
         * If none are intersecting, leave activeId unchanged. */
        let bestId = "";
        let bestRatio = 0;
        for (const [id, r] of ratios) {
          if (r > bestRatio) {
            bestId = id;
            bestRatio = r;
          }
        }
        if (bestId) setActiveId(bestId);
      },
      {
        /* Trigger band: between 25% from top and 60% from bottom.
         * Matches a comfortable reading position. */
        rootMargin: "-25% 0% -60% 0%",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    observerRef.current = observer;
    return () => observer.disconnect();
  }, []);

  const lastUpdated = useMemo(() => formatLastUpdated(POLICY_LAST_UPDATED), []);

  return (
    <>
      <PageHeader />

      <main className="relative isolate">
        {/* Lavender wash backdrop — matches Hero/CTA so the page
            visually belongs to the same site. Wash + ambient orbs
            sit behind everything via z-[-1]. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 12%, rgba(189,112,246,0.18) 0%, rgba(75,40,255,0.06) 38%, transparent 72%), linear-gradient(180deg, #ffffff 0%, #faf6ff 50%, #f5efff 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-[15%] top-[8%] hidden h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#4B28FF] opacity-[0.10] blur-[160px] md:block -z-10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-[8%] top-[3%] hidden h-[260px] w-[260px] rounded-full bg-[#8B5CF6] opacity-[0.08] blur-[140px] md:block -z-10"
        />

        {/* ─── Hero ─────────────────────────────────────────── */}
        <section
          aria-labelledby="privacy-title"
          className="mx-auto w-full max-w-[1280px] px-6 pt-16 pb-10 sm:px-10 sm:pt-20 sm:pb-14 lg:px-14 lg:pt-28"
        >
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="eyebrow"
          >
            Privacy Policy
          </motion.p>
          <motion.h1
            id="privacy-title"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: EASE }}
            className="display-lg mt-4 max-w-[18ch]"
          >
            What we collect,
            <br />
            and{" "}
            <em
              className="font-normal not-italic"
              style={{
                fontFamily: "var(--font-instrument-serif), Georgia, serif",
                fontStyle: "italic",
              }}
            >
              why
            </em>
            .
          </motion.h1>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
            className="mt-7 flex flex-wrap items-center gap-3 text-[13px] text-muted"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-3.5 py-1.5 backdrop-blur-sm">
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
              />
              <span>
                Last updated{" "}
                <time dateTime={POLICY_LAST_UPDATED} className="font-medium text-foreground">
                  {lastUpdated}
                </time>
              </span>
            </span>
            <span className="inline-flex items-center rounded-full border border-border bg-white/70 px-3.5 py-1.5 font-mono text-[12px] tracking-tight backdrop-blur-sm">
              v{POLICY_VERSION}
            </span>
          </motion.div>
        </section>

        {/* ─── TL;DR card ───────────────────────────────────── */}
        <section
          aria-labelledby="tldr-title"
          className="mx-auto w-full max-w-[1280px] px-6 pb-14 sm:px-10 lg:px-14"
        >
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: EASE }}
            /* Gradient-bordered card — matches CTA's surface so the
               only "card" on the privacy page reads as part of the
               same family rather than a one-off. */
            className="rounded-[28px] p-px"
            style={{
              background:
                "linear-gradient(135deg, rgba(75,40,255,0.32) 0%, rgba(197,186,255,0.45) 35%, rgba(244,225,252,0.55) 65%, rgba(75,40,255,0.10) 100%)",
            }}
          >
            <div className="rounded-[27px] bg-white/85 p-7 backdrop-blur-sm shadow-[0_28px_70px_-32px_rgba(75,40,255,0.22),0_6px_18px_-12px_rgba(75,40,255,0.08)] sm:p-9">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-7 rounded-full bg-primary"
                />
                <h2
                  id="tldr-title"
                  className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary"
                >
                  TL;DR
                </h2>
              </div>
              <p className="mt-4 text-[18px] font-medium leading-snug tracking-[-0.01em] text-foreground sm:text-[20px]">
                If you only read one thing on this page, read this.
              </p>
              <ul className="tldr-body mt-6 space-y-4">
                {TLDR.map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <span
                      aria-hidden
                      className="mt-[10px] inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/70"
                    />
                    <span
                      className="text-[15px] leading-relaxed text-foreground/85"
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </section>

        {/* ─── Body — TOC + sections ──────────────────────────
            On lg we render a 2-col grid: sticky TOC on the left,
            content on the right. The TOC uses position:sticky so
            it parks at the top of the viewport while the user
            scrolls through sections; on mobile/tablet it collapses
            to a single inline block above the content. */}
        <section className="mx-auto w-full max-w-[1280px] px-6 pb-24 sm:px-10 sm:pb-32 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16 lg:px-14">
          <aside aria-label="On this page" className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-tertiary">
              On this page
            </p>
            <nav className="mt-4">
              <ol className="list-none space-y-1 p-0">
                {SECTIONS.map((section, idx) => {
                  const isActive = activeId === section.id;
                  return (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        aria-current={isActive ? "location" : undefined}
                        className={`group relative block rounded-md py-1.5 pl-4 pr-2 text-[13.5px] leading-tight transition-colors duration-200 ${
                          isActive
                            ? "text-foreground font-medium"
                            : "text-muted hover:text-foreground"
                        }`}
                      >
                        {/* Active indicator — vertical bar on the
                            left, animates in via opacity rather than
                            width to avoid layout shift on toggle. */}
                        <span
                          aria-hidden
                          className={`absolute left-0 top-1/2 h-[14px] w-[2px] -translate-y-1/2 rounded-full bg-primary transition-opacity duration-200 ${
                            isActive ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        <span className="mr-1.5 inline-block w-5 font-mono text-[11px] text-tertiary tabular-nums">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        {section.title}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </aside>

          <div className="mt-12 lg:mt-0">
            <div className="max-w-[65ch] space-y-16 sm:space-y-20">
              {SECTIONS.map((section, idx) => (
                <motion.article
                  key={section.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className={
                    /* Subtle top divider on every section except the
                       first — matches the editorial "rule between
                       chapters" feel without using cards. */
                    idx === 0 ? "" : "border-t border-border/60 pt-12 sm:pt-16"
                  }
                >
                  <div className="flex items-baseline gap-3">
                    <span
                      aria-hidden
                      className="font-mono text-[12px] tabular-nums text-primary/60"
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h2
                      id={section.id}
                      className="scroll-mt-24 text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-foreground sm:text-[30px]"
                    >
                      {section.title}
                    </h2>
                  </div>
                  {section.lede && (
                    <p className="mt-4 text-[16px] leading-relaxed text-muted sm:text-[17px]">
                      {section.lede}
                    </p>
                  )}
                  <div className="prose-policy mt-6 space-y-5 text-[15.5px] leading-[1.7] text-foreground/85 sm:text-[16px]">
                    {section.body.map((para, pIdx) => {
                      if (para.kind === "p" && para.text) {
                        return (
                          <p
                            key={pIdx}
                            dangerouslySetInnerHTML={{ __html: para.text }}
                          />
                        );
                      }
                      if (para.kind === "h3" && para.text) {
                        return (
                          <h3
                            key={pIdx}
                            className="mt-8 text-[15px] font-semibold tracking-tight text-foreground"
                          >
                            {para.text}
                          </h3>
                        );
                      }
                      if (para.kind === "ul" && para.items) {
                        return (
                          <ul key={pIdx} className="space-y-2.5 pl-0">
                            {para.items.map((item, i) => (
                              <li
                                key={i}
                                className="relative flex gap-3 pl-0"
                              >
                                <span
                                  aria-hidden
                                  className="mt-[10px] inline-block h-1 w-1 flex-shrink-0 rounded-full bg-foreground/40"
                                />
                                <span
                                  dangerouslySetInnerHTML={{ __html: item }}
                                />
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      return null;
                    })}
                  </div>
                </motion.article>
              ))}

              {/* Footer-of-content note */}
              <div className="border-t border-border/60 pt-12 text-[13.5px] text-tertiary">
                <p>
                  This document is version{" "}
                  <span className="font-mono">{POLICY_VERSION}</span>, last
                  updated{" "}
                  <time dateTime={POLICY_LAST_UPDATED}>{lastUpdated}</time>.
                  Earlier versions are available on request.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* ─── prose-policy: anchor styling for the inline <a>
          tags in policy content. Kept inline as a styled-jsx-style
          <style> so we don't pollute globals.css with a one-page
          rule. Targets only descendants of .prose-policy and the
          TL;DR card's body. */}
      <style jsx global>{`
        .prose-policy a,
        .tldr-body a {
          color: var(--color-primary);
          text-decoration: underline;
          text-decoration-color: rgba(75, 40, 255, 0.35);
          text-underline-offset: 3px;
          transition: text-decoration-color 0.18s ease;
        }
        .prose-policy a:hover,
        .tldr-body a:hover {
          text-decoration-color: var(--color-primary);
        }
        .prose-policy strong {
          font-weight: 600;
          color: var(--color-foreground);
        }
      `}</style>
    </>
  );
}

/* ─── Page header ─────────────────────────────────────────────
 * Minimal — the marketing Navbar lives only in the hero region of
 * the home page (absolute positioning), so inner pages need their
 * own. Logo on the left, "Back to home" on the right. Sticky with
 * a soft frosted background so it stays available as the user
 * scrolls a long policy. */
function PageHeader() {
  return (
    <header
      role="banner"
      className="sticky top-0 z-40 border-b border-border/40 bg-white/70 backdrop-blur-md backdrop-saturate-150"
    >
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-6 py-4 sm:px-10 lg:px-14">
        <Link
          href="/"
          aria-label="TGlobal, back to home"
          className="inline-flex items-center transition-opacity hover:opacity-80"
        >
          <LogoMark size={32} />
        </Link>
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 text-[13.5px] font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft />
          <span>Back to home</span>
        </Link>
      </div>
    </header>
  );
}

function ArrowLeft() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="transition-transform duration-200 group-hover:-translate-x-0.5"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
