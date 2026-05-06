"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LogoMark from "./primitives/LogoMark";

/* ─── NavLink — picks Next.js Link for routes vs plain <a> for anchors.
   ─────────────────────────────────────────────────────────────
   • Routes ("/work", "/about", "/contact") → <Link>: SPA-fast,
     PageTransition runs the fade animation between pages.
   • In-page anchors ("#talk-to-us") → <a>: Lenis (smooth scroll)
     intercepts the click and animates the scroll. Routing through
     Next.js Link would trigger a full page change instead.
   • Cross-page anchors ("/#talk-to-us") → <Link>: Next routes to /
     and the browser's hash-scroll restoration takes over. Works from
     any page so the CTA pill keeps its target reachable site-wide.
   • aria-current — when the link's `href` matches the current pathname
     we tag it `aria-current="page"`. Screen readers announce "current
     page" and the .nav-link CSS shows a persistent underline. */
function NavLink({
  href,
  className,
  onClick,
  children,
  ariaLabel,
  ariaCurrent,
}: {
  href: string;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
  ariaCurrent?: "page" | undefined;
}) {
  /* Pure in-page anchor — keep as <a> for Lenis to intercept. */
  if (href.startsWith("#")) {
    return (
      <a
        href={href}
        className={className}
        onClick={onClick}
        aria-label={ariaLabel}
        aria-current={ariaCurrent}
      >
        {children}
      </a>
    );
  }
  /* Route or cross-page anchor — Next.js Link handles both. */
  return (
    <Link
      href={href}
      className={className}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
    >
      {children}
    </Link>
  );
}

/* Why `absolute` (not `fixed` or `sticky`):
   ──────────────────────────────────────────
   The navbar lives inside the hero only — the user sees it on first
   paint over the hero, and it scrolls away naturally with the rest of
   the document as they scroll into Stats / Problem / etc. With
   `absolute inset-x-0 top-0`, the header sits at the top of its
   containing block (the body, since Navbar is rendered above <main> in
   page.tsx) and participates in document scroll: as the user scrolls
   down, the navbar's box translates up off-screen with the page and is
   no longer in viewport once we're past hero-height (~95 px navbar +
   hero height).

   Knock-on simplifications now that nav is hero-scoped:
     • No more `scrolled` state / scroll listener — there is no
       "navbar overlapping content past the hero" condition to drive a
       background blur swap. Background stays transparent so the hero
       art reads through.
     • No more transform/hide-on-scroll plumbing — the navbar simply
       leaves the viewport via document scroll, no separate animation
       needed.
     • `header-slide` keyframe (small -14 px arrival slide-down) is
       still played once on mount to soften the initial paint. */


interface NavLink {
  readonly label: string;
  readonly href: string;
}

/* Nav links — multi-page architecture.
   ────────────────────────────────────────────────────────────
   Each link points to a top-level marketing route. Links to
   in-page anchors on the home page (#problem, #how-it-works,
   #capabilities, #faq) are reachable by scrolling on /, by
   clicking through Footer's quick-links, or by deep-linking
   (e.g. /#problem from any page).

   Add a route here ONLY after its page.tsx exists, otherwise
   visitors hit a 404. /services and /contact are pending and
   will be added with the Friday commit. */
const NAV_LINKS: readonly NavLink[] = [
  { label: "Work", href: "/work" },
  { label: "Process", href: "/process" },
  { label: "About", href: "/about" },
] as const;

/* Theme — light vs dark hero.
   ────────────────────────────────────────────────────────────
   The Navbar lives over the hero (absolute positioning, scrolls away
   with the document — see top-of-file comment). So the legible
   text colour depends on what's behind it:
     • light  → lavender wash / white  → dark text  (default)
     • dark   → near-black / gradient  → white text
   We expose the choice as a prop so each page declares its own
   theme at the call site (no automatic pathname sniffing — easier
   to grep, easier to override, no surprise behaviour for new
   pages). The actual recolouring is done via CSS custom
   properties scoped to the <header> element so .nav-link, the
   LogoMark, and the burger all inherit the same value. */
export type NavbarTheme = "light" | "dark";

interface NavbarProps {
  /** Theme based on the hero background. Defaults to "light". */
  theme?: NavbarTheme;
}

/* Per-theme CSS variable bundles. The keys map to the variables
   read by .nav-link in globals.css plus a few we use inline (logo
   colour, burger hover background). Using `as const` keeps the
   TypeScript narrowing intact and the bundle inlines cleanly into
   the style attribute. */
const THEME_TOKENS = {
  light: {
    "--nav-fg": "var(--color-foreground)",
    "--nav-fg-hover": "var(--color-primary)",
    "--nav-accent": "var(--color-primary)",
    "--nav-burger-hover": "rgba(21, 19, 30, 0.05)",
  },
  dark: {
    "--nav-fg": "#ffffff",
    /* Stay white on hover — going purple-on-dark dims the contrast.
       The animated underline (--nav-accent) keeps the brand colour. */
    "--nav-fg-hover": "#ffffff",
    "--nav-accent": "var(--color-primary)",
    "--nav-burger-hover": "rgba(255, 255, 255, 0.08)",
  },
} as const;

export default function Navbar({ theme = "light" }: NavbarProps = {}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);
  const pathname = usePathname();

  /* Active route detection.
     ─────────────────────────────
     A link is "current" when its href is the exact pathname (so
     /work is active on /work but NOT on /work/skyline — the slug
     page has its own breadcrumb-style "← All work" affordance).
     Returns "page" for the current link, undefined otherwise so
     React drops the attribute entirely (cleaner than empty
     string). */
  const isCurrent = (href: string): "page" | undefined =>
    pathname === href ? "page" : undefined;

  /* Resolve the theme token bundle once per render. Cast through
     CSSProperties so TypeScript accepts the custom-property keys. */
  const themeStyle = THEME_TOKENS[theme] as React.CSSProperties;

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
      /* `absolute` (see top-of-file comment) so the navbar lives at the
         top of the document, scrolls away with the hero, and never
         overlaps later sections. Background stays transparent so the
         hero art reads through; no scroll-driven swap.

         The `style` prop merges the entrance-animation keyframe with
         the per-theme CSS variables. The variables cascade to .nav-link
         (via globals.css), to LogoMark (via inherited `color`), and to
         the burger button (via the inline var() lookup). */
      className="absolute inset-x-0 top-0 z-50 w-full bg-transparent"
      style={{
        animation: "header-slide 0.6s cubic-bezier(0.22,1,0.36,1) both",
        color: "var(--nav-fg)",
        ...themeStyle,
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-5 sm:px-8 lg:px-14 xl:px-20">
        {/* Logo — always routes to home (/), not the in-page anchor.
            Convention: clicking the logo always takes you to the
            homepage of the site, regardless of which page you're on.
            Color is inherited from <header> via currentColor so the
            same component reads on light AND dark heroes. */}
        <NavLink
          href="/"
          ariaLabel="TGlobal home"
          className="focus-ring inline-flex items-center transition-transform duration-300 hover:-translate-y-[1px]"
        >
          <LogoMark size={40} />
        </NavLink>

        {/* Desktop nav — Figma spec: gap 24px between items */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-6 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              className="nav-link"
              ariaCurrent={isCurrent(link.href)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop CTA — uses /#talk-to-us so it works from any route.
            On home (/) the hash scrolls to the section; from /work or
            /about it routes home and the browser restores the hash.
            The brand-purple pill reads on every theme so it doesn't
            need a dark-mode variant. */}
        <NavLink
          href="/#talk-to-us"
          className="pill pill-primary focus-ring hidden md:inline-flex"
        >
          Start Building
        </NavLink>

        {/* Mobile burger — color inherits from <header> (currentColor).
            Hover background reads --nav-burger-hover via the
            .nav-burger CSS class so the same element themes
            automatically per-page (see globals.css). */}
        <button
          ref={burgerRef}
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((open) => !open)}
          className="nav-burger focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors md:hidden"
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
              <NavLink
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className="py-3 text-lg font-medium tracking-[-0.02em] text-foreground"
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              href="/#talk-to-us"
              onClick={closeMobile}
              className="pill pill-primary focus-ring mt-4 self-start"
            >
              Start Building
            </NavLink>
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
