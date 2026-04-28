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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);

  /* rAF-gated scroll listener — passive scroll events on 120 Hz devices
     fire ~120×/sec; coalescing them into one read per frame keeps state
     updates aligned to paint. Cleanup must cancel any pending rAF or it
     can fire after unmount and assign to a stale state setter. */
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 16);
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
      className={`fixed inset-x-0 top-0 z-50 w-full transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-b border-border/60 shadow-[0_1px_0_rgba(12,10,31,0.04)]"
          : "bg-transparent border-b border-transparent"
      }`}
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
