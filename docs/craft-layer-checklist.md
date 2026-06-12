# TGlobal Craft Layer — Non-Negotiable Micro-Details

A practical, grouped checklist for developers working on animation, interaction, and motion design quality. Group by discipline, with concrete examples from our primitives (AnimateIn, MagicCard, WordReveal, marquee, NumberTicker, custom cursor).

---

## Motion Design Tokens (Duration/Easing/Stagger as a Token Set)

**Goal:** Single source of truth for animation rhythm. All motion timings, easing curves, and stagger intervals derive from a unified token set, ensuring consistency across every page component.

**Current State:** 
- Easing is universally `cubic-bezier(0.22, 1, 0.36, 1)` (hard constraint in AGENTS.md).
- Durations are hard-coded throughout components (AnimateIn defaults to `0.7s`, WordReveal uses `0.8s`).
- Stagger increments vary (0.01s for characters, 0.04s for lines, no formal token).
- CSS variables exist in `globals.css` (--color-*), but NO motion token layer yet.

### Checklist

- [ ] **Define duration tokens in globals.css @theme block**
  - Add to `src/app/globals.css` inside the `@theme inline { ... }` block:
    ```css
    --duration-instant: 100ms;      /* for skip/immediate transitions */
    --duration-fast: 160ms;         /* for micro-interactions (button press) */
    --duration-normal: 300ms;       /* default reveal, fade, shift */
    --duration-slow: 500ms;         /* for longer cinematic sequences */
    --duration-cinema: 800ms;       /* for hero/marquee entrance reveals */
    ```
  - Rationale: matches AnimateIn's 0.7s default ≈ 700ms (round to 800ms cinema), short interactions at 300ms (normal), micro-interactions at 160ms fast.

- [ ] **Define easing tokens in globals.css @theme block**
  - Add to `@theme inline`:
    ```css
    --easing-out: cubic-bezier(0.22, 1, 0.36, 1);     /* universal curve */
    --easing-expo-out: cubic-bezier(0.16, 1, 0.3, 1); /* slightly gentler for longer durations */
    --easing-in-out: cubic-bezier(0.42, 0, 0.58, 1);  /* for state transitions (toggle, collapse) */
    ```
  - Rationale: your universal curve is `--easing-out`; offer one softer variant (`expo-out`) for 800+ms sequences where the original curve feels too snappy; in-out for symmetric transitions.
  - **Constraint:** Never deviate from these three curves. If a design requires a fourth, escalate to leadership—it signals rhythm inconsistency.

- [ ] **Define stagger tokens in globals.css @theme block**
  - Add to `@theme inline`:
    ```css
    --stagger-char: 0.01s;       /* character-by-character SplitText reveals */
    --stagger-line: 0.04s;       /* line-by-line or small list items */
    --stagger-card: 0.08s;       /* card-grid stagger (WorkFeatured case studies) */
    --stagger-section: 0.12s;    /* section-level stagger (hero sections, steps) */
    ```
  - Rationale: 0.01s for micro-stagger (fast drip effect), 0.04s for readable pauses (line reveals), 0.08s for visual breathing room (card grids), 0.12s for major section staging.

- [ ] **Migrate hardcoded durations to token references**
  - [ ] AnimateIn: replace `duration = 0.7` default with `duration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--duration-cinema'))` or inject via CSS.
  - [ ] WordReveal: check current duration, set to `--duration-cinema` (0.8s).
  - [ ] NumberTicker: check increment timing, pin to `--duration-normal` (0.3s) if auto-animating on mount, or `--duration-cinema` if scroll-driven.
  - [ ] MagicCard cursor glow: ensure hover reveal is `--duration-fast` (160ms).
  - [ ] Marquee loops: keep current durations (22s, 50s—these are intentionally long background rhythms, not user-facing motion).

- [ ] **Migrate GSAP animations to token references**
  - Example pattern (for any GSAP timeline in a component):
    ```typescript
    const getDurationMs = (tokenName: string): number => {
      const root = document.documentElement;
      const value = getComputedStyle(root).getPropertyValue(tokenName).trim();
      return parseFloat(value) * 1000; // CSS tokens in ms; GSAP expects ms
    };
    
    const tl = gsap.timeline();
    tl.from('.headline', {
      duration: getDurationMs('--duration-cinema') / 1000, // convert back to seconds for GSAP
      opacity: 0,
      ease: getComputedStyle(root).getPropertyValue('--easing-out'),
    });
    ```
  - Apply this pattern to: WorkHero headline reveal, ProcessHero headline reveal, WorkGrid staggered card entrance, ProcessSteps line animations.

- [ ] **Document token usage in a shared lib export**
  - Create `src/lib/motionTokens.ts`:
    ```typescript
    export const MOTION_TOKENS = {
      durations: {
        instant: 'var(--duration-instant)',
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
        cinema: 'var(--duration-cinema)',
      },
      easings: {
        out: 'var(--easing-out)',
        expoOut: 'var(--easing-expo-out)',
        inOut: 'var(--easing-in-out)',
      },
      staggers: {
        char: 'var(--stagger-char)',
        line: 'var(--stagger-line)',
        card: 'var(--stagger-card)',
        section: 'var(--stagger-section)',
      },
    };
    
    export const getRawTokenValue = (cssVar: string): string => {
      if (typeof window === 'undefined') return '0';
      return getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
    };
    
    export const getTokenMs = (cssVar: string): number => {
      const value = getRawTokenValue(cssVar);
      return parseFloat(value) * 1000; // assume CSS value is in seconds, return ms
    };
    ```
  - Import and use: `const duration = getTokenMs(MOTION_TOKENS.durations.cinema);` in GSAP calls.

- [ ] **Verify token consistency across all animation components**
  - Run a search across the codebase:
    ```bash
    grep -r "duration\|ease\|stagger" src/components --include="*.tsx" | grep -v "node_modules" | head -50
    ```
  - For each match, check:
    - Is the value a magic number (e.g., `0.3`, `400ms`, `"cubic-bezier(...)"`)? 
    - If yes, map it to the nearest token.
    - If no token fits, create a new one and document why.

- [ ] **Test token cascading under prefers-reduced-motion**
  - When `prefers-reduced-motion: reduce` is active, motion tokens should NOT be used (animations should skip or instant-finish).
  - See [Reduced-Motion Parity](#reduced-motion-parity-visual-equivalence-with-motion-onoff) section for gating pattern.

---

## Choreography & Sequencing (GSAP SplitText Character/Line Reveals + Anticipation)

**Goal:** Orchestrated entrance animations guide viewer attention through content in a deliberate sequence. Text reveals character-by-character, images fade in with stagger, secondary elements wait for headlines to settle.

**Current State:**
- AnimateIn uses IntersectionObserver + CSS `data-in-view` attribute (no GSAP).
- No SplitText integration yet (SplitText plugin is free as of April 2025).
- No formal "anticipation" (ease-out curves exist, but stagger sequences are not choreographed).
- WordReveal likely uses a loop-based reveal, needs audit for stagger consistency.

### Checklist

- [ ] **Introduce GSAP SplitText for headline reveals (WorkHero, ProcessHero)**
  - [ ] Import SplitText: `import SplitText from 'gsap/SplitText';` and register: `gsap.registerPlugin(SplitText);` at top of component.
  - [ ] WorkHero: the pinned headline "Work that ships. → Nine Industries. One Team." (pixelate morph or similar):
    ```typescript
    useEffect(() => {
      const headline = document.querySelector('.work-hero-headline');
      if (!headline) return;
      
      const split = new SplitText(headline, { type: 'chars' });
      const tl = gsap.timeline();
      
      // Anticipation: fade in headline container first (no characters yet)
      tl.from(headline, { duration: 0.2, opacity: 0, ease: 'power1.out' })
        // Then reveal characters in sequence
        .from(split.chars, {
          duration: 0.8,
          opacity: 0,
          y: 10,
          stagger: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stagger-char')),
          ease: getComputedStyle(document.documentElement).getPropertyValue('--easing-out'),
        }, 0.1); // start 100ms after headline container fade
    }, []);
    ```
  - Rationale: the headline is the primary focus. Characters stagger at 0.01s intervals, so 70-char headline takes ~700ms (one cinema-duration cycle) to fully reveal. The 100ms offset before character reveal starts gives the eye a moment of "oh, something's coming."

- [ ] **Apply stagger sequencing to image galleries (WorkGrid, WorkFeatured)**
  - [ ] WorkGrid case study tiles (3–6 cards visible per scroll section):
    ```typescript
    useEffect(() => {
      const cards = document.querySelectorAll('.work-card');
      const tl = gsap.timeline();
      
      tl.from(cards, {
        duration: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--duration-normal')) / 1000,
        opacity: 0,
        y: 20,
        stagger: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stagger-card')),
        ease: getComputedStyle(document.documentElement).getPropertyValue('--easing-out'),
      });
    }, []);
    ```
  - [ ] WorkFeatured (hero case study tile with BorderBeam glow, MagicCard cursor-tracking):
    - Card image fades up first (0.6s).
    - Badge/label slides up 100ms later (0.4s duration).
    - NumberTicker count-up starts 200ms after badge.
    - CTA button scales in at the end (0.3s).
    - Total sequence: ~1.2s from card image to button ready.

- [ ] **Body copy & list item stagger (ProcessContrast, ProcessQA)**
  - [ ] ProcessContrast: if the section has a title + 2–4 paragraphs:
    ```typescript
    const split = new SplitText('p, li', { type: 'lines' });
    tl.from(split.lines, {
      duration: 0.5,
      opacity: 0,
      y: 10,
      stagger: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stagger-line')),
      ease: getComputedStyle(document.documentElement).getPropertyValue('--easing-out'),
    });
    ```
  - Rationale: 0.04s stagger on lines means a 3-line paragraph takes ~120ms to fully reveal—fast enough to feel instant to readers, but slow enough to guide the eye top-to-bottom.

- [ ] **Icon + text pairing (ProcessSteps, ProcessAnatomy)**
  - If a step has an icon and a label:
    - Icon fades + scales up: 0.4s.
    - Label text slides up: starts 100ms after icon, duration 0.4s.
    - This 100ms gap (anticipation) makes the label feel "pulled up" by the icon.
  - Pattern:
    ```typescript
    tl.from('.step-icon', { duration: 0.4, opacity: 0, scale: 0.8, ease: 'back.out' })
      .from('.step-label', { duration: 0.4, opacity: 0, y: 10 }, 0.1);
    ```

- [ ] **Scroll-driven entrance (ProcessTriptych, WorkMarquee if applicable)**
  - If using GSAP ScrollTrigger to drive character reveals:
    ```typescript
    gsap.from(split.chars, {
      scrollTrigger: {
        trigger: '.triptych-headline',
        start: 'top center',
        end: 'bottom center',
        markers: false, // set to true during development
      },
      duration: 1,
      opacity: 0,
      y: 20,
      stagger: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stagger-char')),
      ease: getComputedStyle(document.documentElement).getPropertyValue('--easing-out'),
    });
    ```
  - **Constraint:** ScrollTrigger must be cleaned up and recreated on every SPA route change (use GSAP Context):
    ```typescript
    useEffect(() => {
      const ctx = gsap.context(() => {
        gsap.from('.triptych-headline', { /* ... */ });
      }, ref);
      return () => ctx.revert(); // Clean up on unmount or route change
    }, []);
    ```

- [ ] **Test choreography under reduced-motion**
  - When `prefers-reduced-motion: reduce`, the timeline should skip to its end state instantly (opacity: 1, transform: none).
  - Pattern (in GSAP timeline setup):
    ```typescript
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tl = gsap.timeline({ paused: prefersReduced });
    if (prefersReduced) tl.progress(1); // jump to end
    ```

---

## Navigation & Scroll (Anchor Offset Under Sticky Nav, Scroll Restoration, View Transitions Caveats)

**Goal:** Users navigate smoothly between sections and pages; links target section anchors without being obscured by the sticky nav; scroll position is preserved on back/forward; page transitions don't break ScrollTrigger.

**Current State:**
- Sticky nav exists (height TBD; check src/components/layout/).
- Anchor links (#WorkGrid, #ProcessSteps, etc.) may exist but likely lack scroll-margin-top.
- Page transitions use framer-motion opacity-only (safe, per AGENTS.md hard constraints).
- Lenis smooth scroll is active (1.3 integration with GSAP ticker, lerp 0.08).
- View Transitions API is NOT in use (good—avoids ScrollTrigger breakage).

### Checklist

- [ ] **Measure sticky nav height and define scroll-margin-top**
  - [ ] Inspect nav element: `document.querySelector('nav').offsetHeight` (measure in browser DevTools).
  - [ ] Assume nav is ~80px tall (common for headings + padding).
  - [ ] Add to globals.css:
    ```css
    :root {
      --nav-height: 80px; /* Update this when nav changes */
    }
    
    section[id],
    h2[id], h3[id],
    [role="region"][id] {
      scroll-margin-top: calc(var(--nav-height) + 1rem);
    }
    
    button, a[href], [role="button"] {
      scroll-margin-top: calc(var(--nav-height) + 0.5rem);
    }
    ```
  - [ ] Dynamic measurement (if nav height varies by breakpoint):
    ```typescript
    useEffect(() => {
      const updateNavHeight = () => {
        const nav = document.querySelector('nav');
        if (nav) {
          const height = nav.offsetHeight;
          document.documentElement.style.setProperty('--nav-height', `${height}px`);
        }
      };
      updateNavHeight();
      window.addEventListener('resize', updateNavHeight);
      return () => window.removeEventListener('resize', updateNavHeight);
    }, []);
    ```

- [ ] **Verify all major section IDs are anchor-linkable**
  - [ ] WorkHero: id="WorkHero" or id="work-hero" (choose convention, stay consistent).
  - [ ] WorkFeatured: id="WorkFeatured".
  - [ ] WorkGrid: id="WorkGrid".
  - [ ] WorkMarquee: id="WorkMarquee" (if has scrolling content).
  - [ ] WorkProcessTeaser, WorkMetrics, WorkTestimonials, WorkCTA: each with id.
  - [ ] ProcessHero: id="ProcessHero".
  - [ ] ProcessContrast, ProcessSteps, ProcessAnatomy, ProcessTriptych, ProcessArtifacts, ProcessQA, ProcessCTA: each with id.
  - [ ] Test: navigate to `/#WorkGrid` in browser—should scroll to section with space under nav. Repeat for `/process#ProcessSteps`.

- [ ] **Configure Lenis scroll-margin-top compatibility**
  - Lenis drives scroll via GSAP ticker (lerp 0.08 = smooth, wheelMultiplier 1.2 = responsive).
  - Ensure scroll-margin-top is respected: Lenis should use browser's native scroll-offset calculation.
  - [ ] Check Lenis config in the page root (likely app/layout.tsx):
    ```typescript
    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 1.2,
      // Lenis respects scroll-margin-top natively in recent versions (1.3+)
    });
    ```
  - [ ] If Lenis version < 1.1, upgrade: `npm install lenis@latest`.

- [ ] **Test scroll restoration on SPA route changes**
  - [ ] Start on /work, scroll down to WorkGrid (e.g., 800px down the page).
  - [ ] Click a case study link → navigates to /work/[slug].
  - [ ] Hit browser back button → should scroll back to ~800px (same position in WorkGrid).
  - [ ] Next.js 16 App Router handles this automatically; verify no `scroll: false` flag in Link components unless intentional.
  - [ ] If custom scroll reset is needed (e.g., force to top on certain routes), explicitly use: `window.scrollTo(0, 0)` in a useEffect with dependency on route change.

- [ ] **Document View Transitions API non-use**
  - [ ] Do NOT implement `<ViewTransition>` from React or Next.js experimental features.
  - [ ] Reason: View Transitions API conflicts with GSAP ScrollTrigger on repeat visits (documented bug; requires ScrollTrigger cleanup on every page transition).
  - [ ] Current framer-motion PageTransition (opacity-only) is safer and avoids this pitfall.
  - [ ] If a future design requires View Transitions (cross-fade image carousel, etc.), escalate—will require ScrollTrigger refactor.

- [ ] **Disable default browser scroll-to-top on route change**
  - [ ] In Next.js 16, scroll behavior is opt-in via the `scroll` prop on Link:
    ```tsx
    <Link href="/work/case-study" scroll={true}>
      {/* scroll={true} is the default; explicitly shown for clarity */}
    </Link>
    ```
  - [ ] If a route should NOT scroll to top (e.g., opening a modal overlay), use `scroll={false}`:
    ```tsx
    <button onClick={() => router.push('/modal-route', { scroll: false })}>
      Open Modal
    </button>
    ```

- [ ] **Verify focus not obscured on keyboard navigation**
  - [ ] Tab through /work and /process pages; as focus moves to each section heading or button, it should scroll into full view with space below the sticky nav.
  - [ ] If focus is partially hidden, increase `scroll-margin-top` value.
  - [ ] WCAG 2.4.11 (Focus Not Obscured) requirement: focused element must be 100% visible, or at least the top 50% of the element must be visible if the element is large.

---

## States (Focus-Visible, Keyboard, Loading/Skeleton, Empty, Error, 404)

**Goal:** Every interactive element has a clear focus ring for keyboard users; every data-loading moment shows a skeleton or shimmer; errors and empty states are helpful and on-brand.

**Current State:**
- AnimateIn uses IntersectionObserver, not form/button input states.
- No visible focus-ring styling yet (likely needs addition to globals.css).
- No skeleton/shimmer components exist (TBD for WorkFeatured, WorkGrid, ProcessArtifacts if data-fetched).
- No 404 or offline error page crafted yet.

### Checklist

- [ ] **Define and test focus-visible styling**
  - [ ] Add to globals.css:
    ```css
    button:focus-visible,
    a:focus-visible,
    [role="button"]:focus-visible,
    [role="menuitem"]:focus-visible,
    input:focus-visible,
    textarea:focus-visible,
    select:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
    
    /* Avoid ugly blue ring on click (mouse users) */
    button:focus:not(:focus-visible),
    a:focus:not(:focus-visible) {
      outline: none;
    }
    ```
  - [ ] Test: Tab through interactive elements on /work and /process; focus ring should appear ONLY on Tab, not on mouse click.
  - [ ] Ring color: `--color-primary` (#4b28ff) has 5.31:1 contrast on white (WCAG AA), 6.52:1 on lavender wash (AAA). Acceptable.
  - [ ] Ring offset: 2px gives breathing room so the ring doesn't overlap the element's border.

- [ ] **Implement roving tabindex for multi-item containers (tabs, accordions, step groups)**
  - If ProcessSteps is a list of clickable items or tabs:
    ```typescript
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const items = Array.from(document.querySelectorAll('[role="tab"]')); // or .step-item
      const currentIndex = items.indexOf(e.currentTarget);
      let nextIndex = currentIndex;
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % items.length;
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIndex = (currentIndex - 1 + items.length) % items.length;
        e.preventDefault();
      } else if (e.key === 'Home') {
        nextIndex = 0;
        e.preventDefault();
      } else if (e.key === 'End') {
        nextIndex = items.length - 1;
        e.preventDefault();
      }
      
      if (nextIndex !== currentIndex) {
        (items[nextIndex] as HTMLElement).focus();
        (items[nextIndex] as HTMLElement).setAttribute('tabindex', '0');
        (e.currentTarget as HTMLElement).setAttribute('tabindex', '-1');
      }
    };
    ```
  - Rationale: only one item in a multi-item container has tabindex="0" (reachable via Tab), others have tabindex="-1" (reachable only programmatically). Arrow keys move focus within the group without tabbing out.

- [ ] **Create SkeletonCaseStudy component for WorkFeatured if data-fetched**
  - If case study data loads asynchronously:
    ```typescript
    // src/components/SkeletonCaseStudy.tsx
    export default function SkeletonCaseStudy() {
      return (
        <div className="space-y-4">
          {/* Thumbnail placeholder */}
          <div className="h-64 w-full bg-gradient-to-r from-lavender-200 via-white to-lavender-200 bg-[length:200%_100%] animate-shimmer rounded-lg" />
          
          {/* Title placeholder */}
          <div className="h-6 w-3/4 bg-gradient-to-r from-lavender-200 via-white to-lavender-200 bg-[length:200%_100%] animate-shimmer rounded" />
          
          {/* Subtitle placeholder */}
          <div className="h-4 w-1/2 bg-gradient-to-r from-lavender-200 via-white to-lavender-200 bg-[length:200%_100%] animate-shimmer rounded" />
          
          {/* CTA button placeholder */}
          <div className="h-10 w-32 bg-gradient-to-r from-lavender-200 via-white to-lavender-200 bg-[length:200%_100%] animate-shimmer rounded" />
        </div>
      );
    }
    ```
  - Add shimmer animation to globals.css:
    ```css
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .animate-shimmer {
      animation: shimmer 1.5s infinite;
    }
    ```
  - Timing: show skeleton only if loading > 100ms (avoid flash on fast networks):
    ```typescript
    const [showSkeleton, setShowSkeleton] = useState(false);
    
    useEffect(() => {
      const timer = setTimeout(() => setShowSkeleton(true), 100);
      if (data) setShowSkeleton(false);
      return () => clearTimeout(timer);
    }, [data]);
    
    return showSkeleton && !data ? <SkeletonCaseStudy /> : <CaseStudyTile data={data} />;
    ```

- [ ] **Create error state component for data-fetch failures**
  - If WorkGrid or ProcessArtifacts fetch data and can fail:
    ```typescript
    // src/components/ErrorState.tsx
    export default function ErrorState({ 
      title = "Something went wrong", 
      message = "We couldn't load this content. Please try again.", 
      onRetry,
    }: ErrorStateProps) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-6 rounded-lg border border-red-200 bg-red-50">
          <AlertCircle className="w-8 h-8 text-red-600 mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">{title}</h3>
          <p className="text-red-700 text-center mb-6">{message}</p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="px-6 py-2 bg-red-600 text-white rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
            >
              Try Again
            </button>
          )}
        </div>
      );
    }
    ```

- [ ] **Create empty state component for zero-result queries**
  - If WorkGrid can return no results:
    ```typescript
    export default function EmptyStateWorkGrid() {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-16 h-16 bg-lavender-200 rounded-full flex items-center justify-center mb-6">
            <Briefcase className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No case studies yet</h3>
          <p className="text-muted text-center mb-6">Check back soon for our latest work.</p>
          <Link href="/" className="px-6 py-2 bg-primary text-white rounded">Back Home</Link>
        </div>
      );
    }
    ```

- [ ] **Create 404 page with craft animation**
  - Create `src/app/not-found.tsx`:
    ```typescript
    "use client";
    
    import { useEffect, useRef } from "react";
    import gsap from "gsap";
    import Link from "next/link";
    
    export default function NotFound() {
      const svgRef = useRef<SVGSVGElement>(null);
      
      useEffect(() => {
        const tl = gsap.timeline();
        
        // Fade in and scale the 404 number
        tl.from(svgRef.current, {
          duration: 0.6,
          opacity: 0,
          scale: 0.8,
          ease: "back.out",
        })
        // Slide in the message
        .from(".not-found-message", {
          duration: 0.5,
          opacity: 0,
          y: 20,
          ease: "expo.out",
        }, 0.2)
        // Slide in the CTAs
        .from(".not-found-cta", {
          duration: 0.4,
          opacity: 0,
          y: 10,
          stagger: 0.1,
          ease: "expo.out",
        }, 0.5);
      }, []);
      
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
          <svg
            ref={svgRef}
            viewBox="0 0 200 200"
            className="w-40 h-40 mb-8 text-primary"
          >
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-6xl font-bold"
              fill="currentColor"
            >
              404
            </text>
          </svg>
          
          <div className="not-found-message text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Page Not Found
            </h1>
            <p className="text-muted text-lg">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 not-found-cta">
            <Link
              href="/"
              className="px-8 py-3 bg-primary text-white rounded font-semibold hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
            >
              Back Home
            </Link>
            <Link
              href="/work"
              className="px-8 py-3 border-2 border-primary text-primary rounded font-semibold hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
            >
              View Work
            </Link>
          </div>
        </div>
      );
    }
    ```
  - Timing: sequence is ~1.2s total (not urgent to load; user is already lost).
  - Reduces bounce-rate perception: a craft 404 says "we care, even here."

- [ ] **Add aria-busy and aria-live for async state transitions**
  - When WorkFeatured is loading:
    ```tsx
    <div aria-busy={isLoading} aria-live="polite">
      {isLoading ? <SkeletonCaseStudy /> : <CaseStudyTile data={data} />}
    </div>
    ```
  - Screen readers announce "loading" without visual distraction.

---

## Accessibility of Motion (Reduced-Motion Parity Technique, ARIA Live Regions, Vestibular Safety)

**Goal:** Every animation that plays with motion ON has an identical visual final state when reduced-motion is active. Users with vestibular disorders see subtle, short animations only. Screen readers announce motion-driven value changes (counters, progress).

**Current State:**
- AnimateIn ignores `prefers-reduced-motion` by brand decision (motion always on).
- No ARIA live regions yet for NumberTicker or other dynamic counters.
- No vestibular-safety audit (parallax, rapid flashing, full-screen motion TBD).
- Lenis smooth scroll is active (acceptable, but not explicitly tested with motion-off users).

### Checklist

- [ ] **Audit all animations for reduced-motion parity**
  - Principle: when `prefers-reduced-motion: reduce`, the page should render visually IDENTICAL to the "final state" of every animation. No hidden elements, no reflow, no broken layout.
  - Checklist:
    - [ ] WorkHero headline: animates character-by-character. At motion-off, all characters should be visible and in-place (opacity: 1, transform: none) immediately on load.
    - [ ] WorkFeatured case study tile: images fade up. At motion-off, images should be fully visible on page load (no fade-in, just appear).
    - [ ] WorkGrid cards: staggered entrance. At motion-off, all cards should be visible on page load (no stagger animation, all at opacity 1).
    - [ ] ProcessSteps timeline connector line: fills via scroll-driven animation. At motion-off, line should be 100% filled immediately (CSS `view()`-based animation halted).
    - [ ] NumberTicker (WorkMetrics, ProcessHero): counts from 0 to final. At motion-off, jump straight to final number on load (no ticker animation).
    - [ ] Marquee (WorkMarquee): loops continuously. At motion-off, freeze the marquee or show a static grid of items (no loop animation).
  - Test workflow:
    ```bash
    # Run the app at http://localhost:3000
    # Open DevTools > Settings > Rendering > check "Emulate CSS media feature prefers-reduced-motion"
    # Set to "prefers-reduced-motion: reduce"
    # Navigate to /work, /process, and screenshot
    # Compare visual layout to default motion-ON state
    # They should be identical (same element visibility, spacing, typography)
    ```

- [ ] **Implement motion preference detection with mounted gate**
  - Many components will need to branch JSX or GSAP config based on motion preference.
  - Use your existing `src/lib/useMounted.ts` (already in project) to avoid SSR hydration mismatch:
    ```typescript
    // src/lib/useMotionPreference.ts
    import { useEffect, useState } from "react";
    import { useMounted } from "./useMounted";
    
    export function useReducedMotion() {
      const mounted = useMounted();
      const [prefersReduced, setPrefersReduced] = useState(false);
      
      useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReduced(mq.matches);
        
        const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
      }, []);
      
      return mounted && prefersReduced; // Only return true after mount to avoid hydration mismatch
    }
    ```
  - Usage in a component:
    ```typescript
    import { useReducedMotion } from "@/lib/useMotionPreference";
    
    export function WorkHero() {
      const prefersReduced = useReducedMotion();
      const duration = prefersReduced ? 0 : 0.8; // Skip animation if motion reduced
      
      useEffect(() => {
        const tl = gsap.timeline();
        tl.from('.headline', { duration, opacity: 0, ... });
      }, [duration]);
      
      return <section>{/* ... */}</section>;
    }
    ```

- [ ] **Add ARIA live regions to animated counters (NumberTicker)**
  - NumberTicker in WorkMetrics (e.g., "87 Products Built"):
    ```tsx
    <div aria-live="polite" aria-atomic="true" className="text-3xl font-bold">
      <span id="counter-value">0</span>
    </div>
    ```
  - When the ticker updates (via RAF or GSAP), update the text content:
    ```typescript
    const counterEl = document.getElementById('counter-value');
    if (counterEl) {
      counterEl.textContent = Math.round(currentValue).toString();
    }
    ```
  - Screen readers will announce the new number every time it changes, without interrupting ongoing speech.
  - For scroll-driven counters (ProcessHero sprint clock, day countdown):
    ```typescript
    gsap.to('.counter', {
      scrollTrigger: { trigger: '.counter' },
      onUpdate: (self) => {
        const value = Math.round(finalValue * self.progress);
        const el = document.querySelector('#counter-value');
        if (el) el.textContent = value.toString();
        // ARIA live="polite" will announce the change
      },
    });
    ```

- [ ] **Add ARIA live regions to git-log terminal simulator (ProcessHero)**
  - If ProcessHero includes a terminal-like code/log output that streams or scrolls:
    ```tsx
    <div
      role="log"
      aria-live="polite"
      aria-label="Process output log"
      className="terminal-output"
    >
      {logLines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
    ```
  - As new lines are appended, screen readers announce them without the user re-reading the entire log.

- [ ] **Audit for vestibular-unsafe animation patterns**
  - **Avoid:** Full-screen video backgrounds with parallax layers (more than 2 layers at different scroll speeds).
  - **Avoid:** Rapid flashing (> 3 flashes per second). If a skeleton shimmer exists, ensure it's < 2 Hz (1.5s+ per cycle).
  - **Avoid:** Large, abrupt zoom/pan effects (if you zoom from 0.5x to 2x in < 300ms, vestibular-sensitive users feel motion sickness).
  - **Current project safety:** 
    - [ ] WorkMarquee: kinetic-typography skew (±7deg per your code). Safe (static baseline, small rotation).
    - [ ] ProcessHero: pinned canvas with subtle parallax (confirm offsets are < 10% viewport height). Likely safe.
    - [ ] Lenis smooth scroll: 60–120 fps scroll animation. Safe (natural motion, matches physical scrolling).
  - Pattern if in doubt: **keep animation < 500ms total, offset < 50px, easing out (no sharp ease-in).** This avoids vestibular triggers.

- [ ] **Test color-mode parity (dark mode support)**
  - Not strictly motion-related, but pairs with reduced-motion for accessibility.
  - Your color palette uses white background + near-black ink + lavender accents.
  - **Dark mode is optional** (not in current brief), but if implemented:
    - [ ] All motion animations must render identically in dark mode and light mode.
    - [ ] Use CSS custom properties: `--color-primary`, `--color-foreground`, etc., which Tailwind dark: variant will override.
    - [ ] Test: `prefers-color-scheme: dark` + `prefers-reduced-motion: reduce` simultaneously—layout and visibility must be identical.

---

## Performance Hygiene (Compositor-Only Props, Will-Change Discipline, Content-Visibility, Asset Preload/Priority)

**Goal:** Animations hit 60fps smoothly by delegating expensive work to the GPU (compositor). Avoid layout thrashing, repaints, and unnecessary reflows. Images load with correct priority; fonts load before first paint.

**Current State:**
- GSAP handles compositor optimization internally (use transform, opacity only).
- Lenis smooth scroll runs on the GSAP ticker (efficient RAF loop).
- No explicit will-change usage documented.
- Asset loading strategy TBD (fonts, hero image, initial viewport images).

### Checklist

- [ ] **Use compositor-safe properties in all animations**
  - Compositor-safe: `transform`, `opacity`, `filter`. Browser runs these on GPU, no layout recalc.
  - NOT safe: `width`, `height`, `left`, `top`, `margin`, `padding`, `display`. Trigger layout recalc (expensive).
  - [ ] Audit all GSAP timelines:
    ```bash
    grep -r "gsap.to\|gsap.from" src/components --include="*.tsx" | head -30
    ```
  - For each timeline, check:
    - Does it animate `transform`/`opacity`? ✓ Safe.
    - Does it animate `left`/`top`? ✗ Unsafe—rewrite using `transform: translate(x, y)`.
    - Does it animate `width`/`height`? ✗ Unsafe—precompute the final size, animate `transform: scale(x, y)` instead.
  - Example fix:
    ```typescript
    // ✗ Bad
    gsap.to('.card', { width: 400, height: 300, duration: 0.5 });
    
    // ✓ Good
    gsap.to('.card', { transform: 'scale(1.2)', duration: 0.5 });
    // or, if final size must be different:
    const finalWidth = 400, initialWidth = 200;
    gsap.to('.card', {
      transform: `scaleX(${finalWidth / initialWidth})`,
      duration: 0.5,
    });
    ```

- [ ] **Apply will-change strategically (not broadly)**
  - `will-change` tells the browser "prepare GPU layer for upcoming animation."
  - Only use on elements currently animating or about to animate; remove after.
  - Pattern:
    ```typescript
    useEffect(() => {
      const el = ref.current;
      if (el) el.style.willChange = 'transform, opacity';
      
      const tl = gsap.to(el, { duration: 0.8, opacity: 0.5, /* ... */ });
      
      return () => {
        el?.style.willChange = 'auto'; // Reset after animation
        tl.kill();
      };
    }, []);
    ```
  - **Caution:** overuse of will-change (on 50+ elements) can break layer composition and HURT performance. Use only where measured to be necessary.

- [ ] **Gate animations on reduced-motion to skip GPU work**
  - If motion is disabled, skip the animation entirely (saves GPU overhead):
    ```typescript
    const prefersReduced = useReducedMotion();
    
    useEffect(() => {
      if (prefersReduced) return; // Skip animation setup
      
      const tl = gsap.timeline();
      tl.from('.headline', { duration: 0.8, opacity: 0, ... });
    }, [prefersReduced]);
    ```

- [ ] **Preload critical assets (fonts, hero image)**
  - In `src/app/layout.tsx` or `src/components/layout/Header.tsx` (whichever manages `<head>`):
    ```tsx
    // Preload fonts to avoid FOUT (Flash of Unstyled Text)
    <link
      rel="preload"
      href="/fonts/albert-sans-400.woff2"
      as="font"
      type="font/woff2"
      crossOrigin="anonymous"
    />
    <link
      rel="preload"
      href="/fonts/instrument-serif-400-italic.woff2"
      as="font"
      type="font/woff2"
      crossOrigin="anonymous"
    />
    
    // Preload hero image (WorkHero, ProcessHero)
    <link
      rel="preload"
      href="/images/work-hero.webp"
      as="image"
      type="image/webp"
      imagesrcset="/images/work-hero.webp 1200w, /images/work-hero-sm.webp 600w"
      imagesizes="100vw"
    />
    ```

- [ ] **Set fetchPriority on critical images**
  - Use Next.js Image component with priority:
    ```tsx
    import Image from "next/image";
    
    <Image
      src="/images/work-hero.webp"
      alt="Work hero"
      width={1200}
      height={600}
      priority={true} // Loads immediately; LCP optimization
    />
    ```
  - For below-the-fold images (WorkGrid cards, ProcessSteps), omit priority (loads on demand).

- [ ] **Use content-visibility for off-screen sections**
  - Sections like ProcessQA, ProcessCTA below the fold can skip rendering until the user scrolls close:
    ```css
    section[data-below-fold] {
      content-visibility: auto;
      contain-intrinsic-size: auto 500px;
    }
    ```
  - Rationale: browser skips painting/layout for off-screen sections, then resumes when they enter viewport. Saves ~30% main-thread work on initial load.
  - Caveat: `content-visibility: auto` can cause a slight stutter when sections become visible—test on real devices.

- [ ] **Lazy-load JavaScript for below-fold components**
  - Use React.lazy + Suspense for route-level code splitting:
    ```typescript
    const ProcessQA = lazy(() => import('@/components/pages/process/ProcessQA'));
    const ProcessCTA = lazy(() => import('@/components/pages/process/ProcessCTA'));
    
    export default function ProcessPage() {
      return (
        <>
          <ProcessHero />
          <ProcessSteps />
          <Suspense fallback={<ProcessQASkeleton />}>
            <ProcessQA />
          </Suspense>
          <Suspense fallback={<ProcessCTASkeleton />}>
            <ProcessCTA />
          </Suspense>
        </>
      );
    }
    ```

- [ ] **Monitor Core Web Vitals using web-vitals library**
  - Install: `npm install web-vitals`.
  - In `src/app/layout.tsx`:
    ```typescript
    import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
    
    if (typeof window !== 'undefined') {
      getCLS(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    }
    ```
  - Or use the shorter `onCLS`, `onLCP` callbacks in your app:
    ```typescript
    useEffect(() => {
      const handleReport = (metric: Metric) => {
        console.log(`${metric.name}: ${metric.value}ms`);
        // Send to analytics service
      };
      
      getCLS(handleReport);
      getLCP(handleReport);
    }, []);
    ```
  - **Target thresholds (2026):**
    - LCP (Largest Contentful Paint): ≤ 2.5s (good).
    - INP (Interaction to Next Paint): ≤ 200ms (good, replacing FID).
    - CLS (Cumulative Layout Shift): ≤ 0.1 (good).
  - Test at DevTools > Lighthouse or Google PageSpeed Insights.

- [ ] **Verify no jank in scroll-driven animations**
  - Lenis smooth scroll should not cause INP degradation:
    - [ ] Open /work or /process.
    - [ ] Open DevTools > Performance > Record.
    - [ ] Scroll the page (should hit 60fps).
    - [ ] Stop recording, review frame rate graph—should stay flat at 60fps, no dips.
    - [ ] If dips occur, check for expensive onScroll handlers or layout thrashing in GSAP ScrollTrigger callbacks.

---

## Summary & Verification Checklist

Before considering craft layer complete, verify:

- [ ] **Motion tokens defined** (durations, easings, stagger) in globals.css and migrated across all components.
- [ ] **Choreography sequences** set up with GSAP SplitText, stagger, and anticipation on WorkHero, WorkGrid, ProcessHero, ProcessSteps.
- [ ] **Anchor offsets** configured (scroll-margin-top under sticky nav) and tested on both /work and /process.
- [ ] **Scroll restoration** working: back/forward button returns to previous scroll position.
- [ ] **Focus rings** visible on keyboard Tab, invisible on mouse click; all interactive elements are keyboard-navigable.
- [ ] **Loading states** (skeleton + shimmer) in place for async data (WorkFeatured, WorkGrid if fetched).
- [ ] **Error states** and empty states designed and integrated.
- [ ] **404 page** created with craft animation.
- [ ] **Reduced-motion parity** tested: pages render visually identical with motion ON vs. OFF.
- [ ] **ARIA live regions** added to NumberTicker, git-log terminal, async value changes.
- [ ] **Vestibular safety** audited: no full-screen parallax, rapid flashing, or abrupt zoom.
- [ ] **Compositor safety** verified: all animations use transform/opacity only.
- [ ] **Will-change** applied sparingly to high-motion sections, removed after.
- [ ] **Assets preloaded** (fonts, hero images) with fetchPriority.
- [ ] **Core Web Vitals** within target (LCP ≤2.5s, INP ≤200ms, CLS ≤0.1) on real device testing.
- [ ] **No jank on scroll:** 60fps maintained when scrolling /work and /process with Lenis active.

---

## References & Further Reading

- [GSAP Documentation](https://gsap.com/) — Free as of April 2025.
- [GSAP SplitText Plugin](https://gsap.com/docs/v3/Plugins/SplitText/) — Character/line reveal.
- [WCAG 2.4.11 Focus Not Obscured](https://wcag.dock.codes/documentation/wcag2411/) — Keyboard accessibility.
- [W3C ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions) — Screen reader announcements.
- [Web.dev Core Web Vitals](https://web.dev/articles/vitals) — Performance thresholds for 2026.
- [A List Apart: Motion Sensitivity](https://alistapart.com/article/designing-safer-web-animation-for-motion-sensitivity/) — Vestibular safety.
- [Adobe Defensive Design: Motion](https://adobe.design/stories/leading-design/animation-that-fails-safely-defensive-design-for-motion-sensitive-users) — Best practices.
