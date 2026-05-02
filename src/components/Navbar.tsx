"use client";

import { useEffect, useRef, useState } from "react";
import LogoMark from "./primitives/LogoMark";

interface NavLink {
  readonly label: string;
  readonly href: string;
}

const NAV_LINKS: readonly NavLink[] = [
  { label: "Capabilities", href: "#capabilities" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Projects", href: "#our-work" },
] as const;

/* Scroll thresholds for the hide-on-scroll behaviour.
   ────────────────────────────────────────────────────
   • SHOW_BELOW_Y — always show the navbar within the first N pixels of
     the page so the hero never loads with an invisible header.
   • DELTA_THRESHOLD — minimum scroll delta per frame before we consider
     the user's input intentional. Below this, ignore (so trackpad jitter
     and Lenis lerp tail-end don't trigger flickering hide/show toggles
     during the smoothing settle). */
const SHOW_BELOW_Y = 80;
const DELTA_THRESHOLD = 4;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);

  /* rAF-gated scroll listener — passive scroll events on 120 Hz devices
     fire ~120×/sec; coalescing them into one read per frame keeps state
     updates aligned to paint. Cleanup must cancel any pending rAF or it
     can fire after unmount and assign to a stale state setter.

     This single effect drives BOTH:
       • `scrolled` — colour/blur transition once we're past the hero top
       • `hidden`   — translateY(-100%) when the user scrolls DOWN past
                      SHOW_BELOW_Y; back to translateY(0) on any UP scroll
                      or when we're back near the top.
     Direction is inferred from the delta between consecutive frames so
     we don't have to listen for separate "scroll-end" events. */
  useEffect(() => {
    let raf = 0;
    let lastY = window.scrollY;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        setScrolled(y > 16);
        if (y < SHOW_BELOW_Y) {
          setHidden(false);
        } else if (Math.abs(delta) > DELTA_THRESHOLD) {
          setHidden(delta > 0);
        }
        lastY = y;
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const { body } = document;
    const prev = body.style.overflow;
    body.style.overflow = mobileOpen ? "hidden" : prev;
    return () => {
      body.style.overflow = prev;
    };
  }, [mobileOpen]);

  /* Focus management for the mobile drawer.
     ──────────────────────────────────────────
     • On open → move focus into the first link so keyboard / screen-reader
       users land inside the menu instead of having to tab through the page.
     • On close (only if it was previously open) → return focus to the
       burger button so the trigger keeps the focus context. The
       wasOpenRef gate prevents stealing focus on initial mount. */
  useEffect(() => {
    if (mobileOpen) {
      requestAnimationFrame(() => {
        drawerRef.current?.querySelector<HTMLElement>("a")?.focus();
      });
      wasOpenRef.current = true;
    } else if (wasOpenRef.current) {
      burgerRef.current?.focus();
      wasOpenRef.current = false;
    }
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header
      /* `transform` is in the transition list so the hide/show slide
         animates smoothly. The `header-slide` keyframe runs once on
         mount (small -14px slide-down for arrival) and finishes before
         any meaningful user scroll, so it doesn't fight the
         class-based transform afterwards. The mobile drawer being open
         also force-shows the navbar — otherwise scrolling the page
         while the menu is open would leave a hovering drawer with no
         visible parent header. */
      className={`fixed inset-x-0 top-0 z-50 w-full transition-[background-color,backdrop-filter,border-color,box-shadow,transform] duration-300 ease-out ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-b border-border/60 shadow-[0_1px_0_rgba(12,10,31,0.04)]"
          : "bg-transparent border-b border-transparent"
      } ${hidden && !mobileOpen ? "-translate-y-full" : "translate-y-0"}`}
      style={{
        animation: "header-slide 0.6s cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-5 sm:px-8 lg:px-14 xl:px-20">
        {/* Logo */}
        <a
          href="#top"
          aria-label="TGlobal home"
          className="focus-ring inline-flex items-center text-foreground transition-transform duration-300 hover:-translate-y-[1px]"
        >
          <LogoMark size={40} />
        </a>

        {/* Desktop nav — Figma spec: gap 24px between items */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-6 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <a
          href="#talk-to-us"
          className="pill pill-primary focus-ring hidden md:inline-flex"
        >
          Start Building
        </a>

        {/* Mobile burger */}
        <button
          ref={burgerRef}
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((open) => !open)}
          className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/5 md:hidden"
        >
          <BurgerIcon open={mobileOpen} />
        </button>
      </div>

      {/* Mobile drawer
          ──────────────────────────────────────────────────
          • `inert` removes contents from focus order AND a11y tree when
            closed (replaces the previous aria-hidden, which was a WCAG
            violation because focusable links were marked hidden).
          • `dvh` — dynamic viewport height — accounts for the iOS Safari
            URL bar so the drawer never clips on small phones (iPhone SE
            375×667 etc.). 80px is the rendered header height. */}
      <div
        ref={drawerRef}
        id="mobile-menu"
        inert={!mobileOpen}
        className={`overflow-hidden transition-[max-height,opacity] duration-300 md:hidden ${
          mobileOpen ? "max-h-[calc(100dvh-80px)] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-border/60 bg-white/95 px-6 py-6 backdrop-blur-md">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className="py-3 text-lg font-medium tracking-[-0.02em] text-foreground"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#talk-to-us"
              onClick={closeMobile}
              className="pill pill-primary focus-ring mt-4 self-start"
            >
              Start Building
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

function BurgerIcon({ open }: { open: boolean }) {
  const baseLine = {
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    style: { transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)" },
  };
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <line
        x1={open ? 5 : 4}
        y1={open ? 5 : 7}
        x2={open ? 17 : 18}
        y2={open ? 17 : 7}
        {...baseLine}
      />
      <line
        x1="4"
        y1="11"
        x2="18"
        y2="11"
        {...baseLine}
        style={{ ...baseLine.style, opacity: open ? 0 : 1 }}
      />
      <line
        x1={open ? 5 : 4}
        y1={open ? 17 : 15}
        x2={open ? 17 : 18}
        y2={open ? 5 : 15}
        {...baseLine}
      />
    </svg>
  );
}
