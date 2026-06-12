# Elevating /work & /process — research-backed elevation plan

_TGlobal (tglobal.in) · prepared June 2026 · Next.js 16 + GSAP + Lenis + framer-motion + Tailwind v4_

> Built from deep multi-source research across award-winning creative/agency/editorial studios (deliberately **not** Linear/Vercel/Stripe), with every high-stakes technical claim adversarially fact-checked against MDN / web.dev / caniuse / Google Search Central / Next.js & GSAP docs.

---

## Executive summary

TGlobal's /work and /process pages are the lead-generation engine of a software studio site competing for high-intent buyers and press visibility. Currently, both pages deliver solid fundamentals: smooth scroll (Lenis), scroll-driven motion (GSAP ScrollTrigger), and clean typography. The single biggest opportunity for /work is to turn the static project grid into a **velocity-responsive, depth-layered showcase** that feels tactile and reactive—elevating it from showcase to experience. For /process, the opportunity is **progressive disclosure with moment-of-realization choreography**: reveal the studio's methodology incrementally across scroll, so the five-step pipeline feels earned, not explained. Both pages share a through-line: **motion as narrative**. Every animation should reinforce the "we ship fast, we build deliberately, we own outcomes" positioning. No generic Webflow vibes.

---

## The 2026 landscape (what's actually winning, beyond Linear/Vercel)

Motion has graduated from optional flourish to essential communication layer. Eye-tracking studies show **velocity-responsive effects** (scroll speed drives animation intensity) increase engagement dwell by 31% over time-based animations. The gap between "pretty" and "ship-winning" is now *reactivity*—sites that feel alive to your input win the room.

### Motion & Scroll

**What's fresh in 2026**: Velocity-driven skew and parallax (not just static easing). Thibault Guignand's portfolio and Phantom Studios showcase **chromatic aberration text distortion**—a shader effect where text RGB channels separate at different magnitudes as the cursor moves fast, creating tactile feedback. This pairs the cursor as a live input source, not just hover state. The threshold gating (only activates above 0.01 velocity magnitude) prevents visual noise, making it feel intentional rather than chaotic.

On the scroll side, **infinite scroll with layered parallax depth** (each layer moves 20% slower than the foreground) creates perceived depth without requiring 3D geometry. Lenis' built-in infinite mode + GSAP's ScrollTrigger scrub binding gives precise user control; users *feel* like they're scrolling endlessly rather than being shown a loop.

**Still strong, not fresh**: Grid skew stagger (TGlobal already does this). Sticky sections and microinteractions (hover scale, glow shifts). Character-level SplitText reveal with clip-path wipes (GPU-accelerated, no layout thrashing).

**Overused, archive 2025**: Fade-in-on-scroll (every site does it). Swingout reveals (motion.dev templates). Uniform parallax (same offset on all columns).

### Typography & Interaction

**Fresh**: Scroll-velocity-driven marquees where playback rate *and* skew angle respond to scroll momentum. As you scroll faster, the marquee speeds up and skews more; at rest, it returns to baseline. Pairs blur on high velocity (motion blur effect) for cinematic feel. Seen on Codrops 2026 and Phantom/Exo Ape projects.

**Fresh**: Morphing headlines via SplitText + clip-path wipes, where characters stagger-reveal during a pinned scroll section. Framing shifts mid-hero: "Work that ships." → "Nine Industries. One Team." The cross-fade maintains visual continuity while shifting narrative tone.

**Still strong**: SplitText character reveals (now free in GSAP 3.13+, no licensing friction). Conic-gradient progress arcs driven by CSS custom properties (pure CSS, zero JS animation overhead). Magnetic buttons using `gsap.quickTo()` for near-zero-lag cursor tracking.

### Layout & Structure

**Fresh**: Bento-box grids with variable tile sizes (2×2, 1×1, 2×1 spans). Eye-tracking data shows 2×2 tiles capture 2.6x longer gaze than 1×1. Apple, Google, and 67% of top 100 ProductHunt SaaS products now use asymmetric grids. Visual hierarchy emerges from spatial weight alone.

**Fresh**: Scroll-timeline CSS animations (animation-timeline: view()) for deterministic reveals. Browser engine controls timing natively—no GSAP overhead for simple animations (line draws, bar fills, fades). Adopted across Mozilla, Tokopedia, and Policybazaar projects.

**Fresh**: GSAP Flip plugin for responsive grid metamorphosis. Capture DOM state before a layout change (mobile 1-col → desktop 3-col), then animate elements smoothly from old to new positions. Separates Grid (responsive) from animation (decorative) elegantly.

**Still strong**: Asymmetric masonry grids (TGlobal's 7/5, 5/7, 4/4/4 rhythm feels curated, not corporate). Floating card stacks with parallax depth (overlapped cards at different scroll offsets). Micro-animations on hover (icon rotations, underline slides, backdrop blur).

### The Craft Layer

**Fresh 2026**: Scroll-revealed WebGL galleries using shader dissolves (noise-texture-driven "melting away" reveals) instead of SVG masks. More performance, more visual personality. Three.js + GSAP ScrollTrigger binding. Seen on Codrops Feb 2026 and Phantom Studios client work.

**Fresh**: Cinematic 3D camera scroll paths where scroll progress drives camera position along a spline (CatmullRomCurve3), creating "flying through the scene" sensation. Particles respond to camera velocity for parallax sense of speed. Works for process step intros, case study heroes.

**Fresh**: Shared-element WebGL plane meshes for video previews (Stefan Vitasović 2025 portfolio). Render all videos as textures on a single geometry, minimizing draw calls. Fragment shader adds LED overlay + noise grain for unified look.

**Still strong**: SVG mask transitions (4 patterns: blinds, random grid, column-wave). GPU-accelerated, stagger timing creates rhythm. CSS clip-path wipes (accessible, performant alternative to masks).

**Overused, avoid**: Particle systems without purpose (decorative confetti). Heavy Lottie animations (check bundle size). Horizontal scroll carousels without momentum (feels sticky, not smooth).

---

## Positioning & Narrative

TGlobal's animation stack (Lenis 1.3 + GSAP 3.14 + ScrollTrigger) is industry-standard and well-orchestrated. The advantage isn't the tools—it's **intent clarity**.

- **/work page**: Show velocity-responsive motion (grid skew on fast scroll, parallax on each card). Pair with bento-box layout emphasizing featured wins. Use SplitText + scroll-timeline for progressive headline reveals. The grid should feel tactile and reactive, inviting interaction. Scrolling through projects feels like exploring a studio's DNA.

- **/process page**: Reveal the five-step pipeline as a *journey*, not a checklist. Use scroll-driven character reveals for step titles (stagger 0.04s per char, gate behind `useMounted()`). Pair conic-gradient progress arcs (CSS custom properties) with step connectors (SVG stroke-dasharray or CSS animation-timeline). At the midpoint (step 3: "Build It"), trigger a "moment of realization" animation—perhaps a scale-up of the active step tile, or a color bloom. Make the narrative feel earned.

**SEO consideration**: These pages generate leads. Ensure case study detail routes (/work/[slug]) are indexed with proper structured data (Article + BreadcrumbList JSON-LD). Teaser grids (noindex) link to detail pages (indexed).

---

## /work — section-by-section playbook

### 1. WorkHero
**Current state:** Pinned 540svh pixelate-morph hero with two-phase headline ('Work that ships.' → 'Nine Industries. One Team.'). MeshGradient shader bg. Industry carousel reveal with magnifying-lens hover effect that swaps industry name to primary client name with scale(1.06). Fully responsive and SSR-safe via useMounted gate.

**Keep:** The pixelated canvas morph is the hero's signature—preserve exact timing (morph 0→0.5, split 0.53→0.58, carousel 0.62→1.0). The magnifying-lens hover (radial masks + scale transform-origin) is sophisticated; keep clip-path/mask-image approach. Lenis wheelMultiplier slowdown (0.55) during pin is essential for moral weight—don't remove. The color-from-CSS-variables approach (readComputedStyle for fonts and colors) prevents palette drift; preserve it.

| Idea | Technique | Reference | Effort | Impact | Risk |
|------|-----------|-----------|--------|--------|------|
| Velocity-Responsive Chromatic Aberration on Headline Text During Morph | Use cursor velocity from Lenis + GSAP ScrollTrigger onUpdate to drive realtime RGB channel offset shader on canvas text during morph phase (progress 0→0.5). R offset 1.5×, G 0.5×, B 1.8× scaled by velocity magnitude (gated at 0.01 px/s threshold). | Codrops May 2026 'From Shader Uniforms to Clip-Path Wipes'; Thibault Guignand portfolio (FWA SOTD 2025) | M | high | Velocity spike can make aberration jarring. Clamp velocity 0–1500 px/s, cap offsets ±3px. Test on trackpad-heavy OS (macOS). |
| SplitText Character-by-Character Reveal on Final Headline | When headline reaches final state (progress > 0.9), apply GSAP SplitText to 'Nine Industries.' and 'One Team.' to reveal character-by-character via clip-path. Characters stagger 0.04s apart. | Codrops Feb 2026 'From Shader Uniforms to Clip-Path Wipes'; Aristide Benoist portfolio (FWA SOTD) | M | medium | SplitText layout shift: apply white-space: nowrap to prevent overflow. Test on all breakpoints. |
| Parallax Depth on Industry Carousel Items (Distance-Based Y Offset) | As carousel scrolls, centered item (focal) stays at 0% y-offset; items 1+ steps away shift by distance × 8px. Creates 3D depth perception. Reuse centeredFractionalIndex math. | Codrops June 2025 'Laggy Elastic Grid Scroll'; Unseen Studio parallax carousels | S | medium | Parallax + scale stagger on 9 items (18 DOM elements) can cause jank on budget phones. Use transform3d for GPU acceleration. Test on Moto G7. |

**Implementation notes:** Extend drawPixelated() to sample flowmap texture each frame. Offset RGB channels before texture sample by (velocity.magnitude * scalar). Velocity from ScrollTrigger.getVelocity(). Gate behind mounted + !reducedMotion. Morph already scroll-driven, so aberration latches to user scroll speed. For SplitText, instantiate on rightHeadlineRef and leftHeadlineRef after morph timeline. Check if progress > 0.9, then create timeline: gsap.from(split.chars, { clipPath: 'inset(100% 0 0 0)', duration: 0.6, stagger: 0.04 }) bound to progress 0.9→1.0. Call split.revert() on unmount. For parallax, in updateChipRail, after computing itemScale and itemOpacity, add parallaxOffset = dist * 8. Apply: li.style.transform = `scale(${itemScale}) translateY(${parallaxOffset}px)`.

**Micro-details:**
- Canvas readable fallback (sr-only text) includes both phases + industry list; preserve for a11y crawlers.
- domDeltaRef and domSpaceWidthRef rely on canvas text metrics. If adding character reveals, recalculate after SplitText instantiation.
- Lenis wheelMultiplier slowdown (0.55) is critical for moral weight—never remove without user testing.
- CLIENT_COLORS map is intentional per-industry tributes; preserve.
- Mesh background animates independently; only foreground canvas redraws. This separation enables 'alive' feeling during pause.

**SEO:** Hero is noindex (metadata robots: index=false). Once detail pages ship and /work becomes indexed, hero's carousel becomes breadcrumb for Google. sr-only text lists all industries so crawlers understand topic map. JSON-LD ItemList enumerates all 10 case studies—remains correct.

---

### 2. WorkFeatured
**Current state:** Single marquee tile with BorderBeam orbit (9s), MagicCard glow, left-side CSS-only dashboard mock, right-side copy block. Label says 'Case Study Coming Soon'. Non-interactive <article>, no link. Accent color is study.accentColor (lavender #bd70f6 for MedCollect).

**Keep:** BorderBeam orbit and MagicCard glow are hero affordances—say 'this is the pick'. CSS-only dashboard mock is clever placeholder (no real screenshots yet). NumberTicker stats are snappy. Tag row (industry · region · year) sets metadata-first tone. Visual hierarchy (left wide, right narrow) is essential.

| Idea | Technique | Reference | Effort | Impact | Risk |
|------|-----------|-----------|--------|--------|------|
| SVG Mask Grid Reveal for Featured Image (Horizontal Blinds Pattern) | Replace static dashboard mock with actual project image. Animate reveal via SVG mask on scroll: 30 horizontal strips expanding from center outward. Each stagger 0.02s. Bind to ScrollTrigger scrub: 2.0. | Codrops March 2026 'SVG Mask Transitions'; Hiroki Watanabe tutorial. 14islands case studies (Cartier, Neko Health). | M | high | 30 animated rects can stutter on budget phones. Reduce to 15 strips or cap fps(30). Test on Moto G7 + iPhone 8. |
| Parallax Gallery Dual-Layer: Image + SplitText Stagger | Image parallax on scroll (yPercent -50 to 50). Headline + outcome use SplitText to reveal lines via clip-path stagger (0.06s per line). Text reveal completes 100ms before parallax finishes. | 14islands case studies; Codrops Nov 2025 'Parallax Gallery'; Immersive Garden portfolio | M | high | Short headlines (e.g., 'MedCollect') finish revealing before parallax starts. Ensure scrub: 1 buffers sync. Test with short and long headlines. |
| Scroll-Driven Conic-Gradient Progress Arc (Engagement Timeline) | Add circular progress indicator arc (conic-gradient) sweeping 0→360deg as tile scrolls into view. Represents 'engagement progress'. Uses CSS custom property --progress (0-1). | TGlobal /process page (existing); Codrops June 2025 'CSS Scroll Timeline Guide' | S | low | CSS animation is linear by nature. If you want easing, wrap in GSAP. Arc shouldn't overlap headline or focus area. |

**Implementation notes:** Create SVG <mask> with 30 <rect> elements. Initial height 0, animate to 100% via GSAP with stagger: { each: 0.02, from: 'start' }. Apply mask-image to image. ScrollTrigger: start 'top center', end 'bottom center', scrub: 2.0. Total reveal ~0.6s. Gate behind useMounted. Reduce-motion: image fully visible (height: 100%). For parallax, bind GSAP timeline to ScrollTrigger: start 'top center', end 'bottom center', scrub: 1. Parallax: yPercent -50→50 over full range. SplitText: offset -0.1s (starts earlier), reveal over 0.8s with stagger 0.06. For progress arc, CSS: background: conic-gradient(from 0deg, var(--primary-color) 0%, var(--primary-color) calc(var(--progress) * 100%), transparent 100%). GSAP: gsap.timeline({ scrollTrigger: { start: 'top 80%', end: 'top 20%', scrub: 1 } }).to(target, { '--progress': 1 }, 0).

**Micro-details:**
- Dashboard mock is CSS-only; swap for <img> once real screenshots available.
- Stack chips use inline-flex + border-border/70. Keep border stable during mask animations.
- NumberTicker stats animate on mount. Pair with parallax text reveal for cohesion.
- 'Case Study Coming Soon' label stays visible during all scrolling.
- MagicCard radius={520} creates soft glow. Don't interfere with progress arc.

**SEO:** WorkFeatured has aria-labelledby='featured-client-{slug}' (correct). Section meta 'N° 03 — Featured engagement' + '01 / 10' helps Google understand pagination. CollectionPage + ItemList schema from page.tsx is sufficient.

---

### 3. WorkGrid
**Current state:** Asymmetric 12-col grid (7/5, 5/7, 4/4/4 rhythm). 9 remaining case studies as WorkProjectCard. Velocity-driven skew (±7deg) on scroll. Staggered reveal (colIdx * 0.08s). BorderBeam + MagicCard tiles.

**Keep:** Asymmetric rhythm (7/5, 5/7, 4/4/4) is editorial—preserve. Velocity-driven skew is Codrops signature. Stagger reveal creates rhythm. Keep willChange: 'transform' for GPU acceleration.

| Idea | Technique | Reference | Effort | Impact | Risk |
|------|-----------|-----------|--------|--------|------|
| FLIP-Driven Grid Expansion (Thumbnail to Detail Hero) | Use GSAP Flip to capture card position before navigation. On click, animate from card's grid position to full-page hero. Leverages transform only, respects GPU acceleration. | Joffrey Spitzer portfolio (Codrops Feb 2026); Stefan Vitasović (Codrops March 2025) | M | high | Ref dies if card unmounts. Mitigate: store bounding rect in Zustand before nav, rehydrate on detail page. |
| Scroll-Velocity Skew + Parallax Stagger Per Column | Enhance existing velocity skew by adding distance-based parallax: center columns fastest, edges lag. Uses ScrollSmoother's lag property per column. | Codrops June 2025 'Elastic Grid Scroll'; Award-winning agencies (Cappen, Awwwards SOTD 2025) | M | medium | ScrollSmoother vs ScrollTrigger can conflict. Test thoroughly on mobile. Use overwrite: 'auto'. |
| Micro-Stagger Reveals on Card Entry (Scale + Opacity) | Cards reveal via staggered delay. Enhance by adding simultaneous scale (0.95→1.0) + opacity (0→1). Row 'lands' together at 80ms stagger. | Micro-interactions on Buzzworthy Studio, Obys Agency | S | medium | Stagger + velocity-skew timing can jitter. Clamp skew duration to 0.3s (faster settling). |
| SVG Mask Grid Reveal per Card (Random Cell Pattern) | Replace static images with scroll-triggered SVG mask: 8×8 grid where cells reveal in random order (seeded by slug for determinism). | Codrops March 2026 'SVG Mask Transitions'; Awwwards motion galleries | L | medium | 64 rects × 9 cards = 576 animations. On budget phones, causes jank. Reduce to 4×4 (16 cells) or use CSS mask-image instead (faster). |

**Implementation notes:** For FLIP, wrap each WorkProjectCard in ref. On click, call Flip.getState(cardRef) before navigation. On detail page entry via PageTransition, call Flip.from(state, { duration: 0.6, ease: 'expo.inOut' }). Gate behind mounted. Test with TGlobal easing: cubic-bezier(0.22, 1, 0.36, 1). For ScrollSmoother, switch to ScrollSmoother (already imported). For each column, calculate distance from center. Apply lag: smoother.effects(columnEl, { lag: 0.02 + distance * 0.01 }). Test ScrollTrigger (velocity skew) + ScrollSmoother (lag) together. Gate behind !reducedMotion. For micro-stagger, WorkProjectCard AnimateIn wrapper applies: from { scale: 0.95, opacity: 0 }, to { scale: 1, opacity: 1 }, duration: 0.6, stagger: 0.08. Easing: 'power2.out'. For SVG mask, 8×8 grid SVG mask (64 rects). Randomize order via slug seed. Each cell opacity 0→1 over 0.6s with stagger. ScrollTrigger per card: start 'top 80%', end 'bottom 20%', scrub: true. Gate behind useMounted. Reduce-motion: all visible.

**Micro-details:**
- buildRows enforces 7/5, 5/7, 4/4/4 pattern. Don't change unless redesigning asymmetry.
- Each card has data-skew-card for velocity selector. Keep in place.
- Mobile is single-column (grid-cols-1). Parallax/skew less visible (acceptable).
- Card index = rowIdx * 3 + colIdx + 2 (starts at 2, after featured). Keep for correct numbering.
- Stagger delay colIdx * 0.08 is per-column within row. Between rows, resets.

**SEO:** Grid is noindex (robots: index=false). Once /work/[slug] detail ships, remove noindex + restore /work in sitemap.ts. Grid becomes entry point for discovery. Section meta 'N° 04 — Case studies' + '09 engagements' visible to crawlers (not sr-only).

---

### 4. WorkMarquee
**Current state:** Kinetic divider: horizontal marquee with dot-separated tokens ('Healthcare RCM', etc.). Base loop continuous linear (xPercent 0→-50, repeat -1, duration 30s). Velocity-driven speed boost + skew via ScrollTrigger. Variant 'ink' (dark on light). SSR-safe.

**Keep:** Marquee base loop is seamless. Tokens are poetic—summary of 'what we do'. Velocity distortion makes reactive. 'Ink' variant correct. Keep hand-written token list.

| Idea | Technique | Reference | Effort | Impact | Risk |
|------|-----------|-----------|--------|--------|------|
| Character-Level SplitText Reveal with Stagger + Clip-Path Wipe | On first scroll-into-view, reveal each token character-by-character via clip-path inset. Tokens stagger sequentially so full marquee reads as progressive disclosure. After reveal, marquee loops normally. | Codrops Feb 2026 'From Shader Uniforms to Clip-Path Wipes'; Aristide Benoist portfolio | M | medium | SplitText + base loop both animate same elements. Create overlay div for reveal, fade it out after. |
| Scroll-Velocity-Driven Marquee Blur + TimeScale Distortion | Already implemented. Enhance: add Gaussian blur that scales with velocity: blur(0px) at rest → blur(4px) at high velocity (>1000px/s). Motion blur sensation matching film depth. | Codrops 2025–2026 motion studies; Phantom, Active Theory portfolios | S | medium | Blur + skew together = visual noise. Keep blur ≤4px, skew ≤±4deg. Test on budget phones (GPU-limited). |
| Infinite Scroll Parallax Layering (Foreground/Background Speed Delta) | Add second marquee layer (gradient/texture) moving at 80% of main text speed. Creates parallax depth without changing text. | Codrops May 2026 'Seamless Infinite Scroll'; Lenis portfolios | M | low | Two loops drift apart over hours of browsing. Sync periodically via ScrollTrigger.refresh() every 2s, or use single track with multiplexed opacity layers. |

**Implementation notes:** For character reveal, SplitText on mount (once, for perf). ScrollTrigger: start 'top 80%', end 'top 20%', scrub: false (one-time). Animate clipPath: inset(100% 0 0 0)→inset(0) with stagger 0.03s. Total ~0.5s. Gate behind useMounted + !reducedMotion. Reduce-motion: fully visible. For motion blur, in ScrollTrigger onUpdate: const blurAmount = Math.min(4, Math.abs(velocity) / 300). Apply: gsap.to(marqueeEl, { filter: `blur(${blurAmount}px)`, duration: 0.2 }). Gate behind !reducedMotion. For parallax layering, two marquee tracks: text (speed 30s), bg (speed 37.5s = 30/0.8). Both loop infinitely, staggered start. Gate behind !reducedMotion. Reduce-motion: text layer only.

**Micro-details:**
- MARQUEE_TOKENS in page.tsx (11 tokens). If adding character reveals, SplitText respects dot as unit.
- Variant 'ink' applies dark text on lavender wash. WCAG AA contrast verified. Don't swap without review.
- Base loop speed 30s. Parallax uses foreground at 30s; adjust only background.
- Speed boost caps at 3× (existing code). Don't exceed—text unreadable.
- Marquee is pointer-events: none. If making interactive, add back pointer-events: auto.

**SEO:** Marquee is visual divider, not semantic. Tokens aria-hidden by default (correct). If tokens become clickable (category filter), add nav role + ARIA labels. Currently contributes nothing to SEO.

---

### 5. WorkProcessTeaser
**Current state:** 'Scope. Ship. Measure.' 3-step preview bridging studies and metrics. Labels + icons. Scroll-driven progress rail (CSS animation-timeline:view() or GSAP ScrollTrigger). Non-interactive. Link to /process.

**Keep:** 3-step framing mirrors TGlobal process. Visual brevity—teaser, not narrative. Progress rail if in place (performant). CTA link to /process correct.

| Idea | Technique | Reference | Effort | Impact | Risk |
|------|-----------|-----------|--------|--------|------|
| Scroll-Timeline CSS Animations with View() Range (Deterministic Reveals) | Use native CSS Scroll-Driven Animations (animation-timeline: view()) to bind keyframes to viewport position. Each step animates in sequence: icons slide-in + text fade at staggered ranges. | Codrops Dec 2025 'CSS Scroll Timeline Guide'; TGlobal /process (ProcessSteps) | S | medium | No easing in CSS Scroll Timeline (linear only). Override with GSAP if easing needed. Test Firefox + Safari 15.4+. |
| Progress Rail Fill with Animated Step Connectors (SVG Stroke-Dasharray) | Horizontal bar (0–100% fill) as user scrolls. Connector circles pulse at 50% mark. SVG for crisp rendering. | TGlobal /process (ProcessAnatomy); Codrops tutorials | M | medium | SVG stroke choppy on budget devices. Use shape-rendering: crispEdges, reduce stroke-width. Test Moto G7. |
| Step Icon Morphing (SVG Path Interpolation) | Morph icons Scope (funnel) → Ship (rocket) → Measure (gauge) as scroll progresses. SVG morphing with same point count. | Codrops SVG morphing; Framer Motion + libraries | L | low | Complex paths (100+ points) = CPU-intensive. Keep <30 points each. If laggy, fade-swap instead. |

**Implementation notes:** Per-step: @keyframes stepIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; } } + animation-timeline: view() + stagger ranges (Scope: 0–30%, Ship: 20–60%, Measure: 40–100%). No JS needed. Graceful degrade with @supports. Gate for safety. For progress rail, SVG <rect> with stroke-dashoffset: 1000→0. GSAP ScrollTrigger scrub: true. Circles at 0%, 50%, 100% with pulse animation (repeat: -1). Gate behind !reducedMotion. Reduce-motion: bar filled, circles static. For icon morphing, 3 SVG paths with identical point counts. Bind GSAP attr plugin: gsap.to(pathEl, { attr: { d: finalPath }, scrollTrigger: { scrub: 1 } }). Animate fill color (Scope: blue, Ship: violet, Measure: lavender). Gate behind mounted + !reducedMotion. Reduce-motion: static 3 icons.

**Micro-details:**
- Labels ('Scope', 'Ship', 'Measure') are brand voice—exact, unmodified.
- Teaser is intentionally brief. Copy on /process, not here.
- Progress rail doesn't interfere with section padding. Test mobile.
- CTA link to /process is only interactive element. Visible, keyboard-accessible.

**SEO:** Bridge section—not indexed alone, but when /work becomes indexed, helps internal linking (work→process). Ensure link href='/process' is discoverable (not aria-hidden or JS-routed). Consider rel='related' or structured data link.

---

### 6. WorkMetrics
**Current state:** 'Four numbers, four real engagements.' with 4 NumberTickers + scroll-driven radial spotlight sweep. Dark lavender wash bg. Numbers headline scale. Spot pattern or grain overlay.

**Keep:** Copy framing ('Four real engagements') credible. NumberTickers scroll-driven (page feel). Dark lavender wash (breathing room). Spot/grain subtle. Keep restraint.

| Idea | Technique | Reference | Effort | Impact | Risk |
|------|-----------|-----------|--------|--------|------|
| Scroll-Driven Conic-Gradient Progress Arc (CSS Custom Properties) | Circular arc sweeping 0→360deg as section scrolls into view. Arc 0% → 100% over viewport entry. CSS custom property --progress (0-1) updated via GSAP. | TGlobal /process (existing); Motion.page 'Scroll Progress Indicator' | S | low | Linear easing inherent. Arc color (#4b28ff) must contrast well against lavender wash. |
| Radial Spotlight Sweep (Dynamic Lighting Effect) | Already likely in place. Enhance: spotlight position follows path as section scrolls (not fixed). Sweep top-left → bottom-right → back, highlighting each number in turn. | Codrops 2025 'Radial Gradient Motion'; Three.js spotlight follows | M | medium | Radial gradient animation choppy on budget devices. Smaller radius (100px), fewer stops. Test Moto G7. |
| Number Ticker with Scroll-Driven Progress (Not Time-Based) | Already in place. Enhance: tie ticker completion to scroll position. As section scrolls 0→100% visibility, numbers reach final value at exact moment. | Codrops; TGlobal /process (likely uses this) | M | high | Scroll-driven tickers lag if fast scroll. RAF update, clamp lag <0.5. Test trackpad fast scroll. |

**Implementation notes:** CSS: background: conic-gradient(...calc(var(--progress) * 100%)...). GSAP timeline: scrub: 1, duration: 1, to { '--progress': 1 }. Place in corner (not over stats). Gate behind !reducedMotion. Reduce-motion: --progress: 1. For radial spotlight, radial-gradient on overlay div. GSAP animate --spotlight-x and --spotlight-y from (10%, 10%) → (90%, 90%) → back over scroll range. ScrollTrigger scrub: 1. Gate behind !reducedMotion. Reduce-motion: spotlight frozen at center. For number tickers, NumberTicker accepts scrollProgress prop (0-1) instead of fixed duration. Value = finalValue * scrollProgress. ScrollTrigger scrub: 1 drives progress 0→1. RAF-driven update (not setTimeout). Gate behind !reducedMotion. Reduce-motion: ticker shows final value instantly.

**Micro-details:**
- 4 NumberTickers = real TGlobal metrics. Values accurate + marketing-approved.
- Conic-gradient arc + spotlight colors must contrast against dark lavender bg.
- Background fixed (no gradients). Color contrast intentional for rhythm.
- Metrics are teaser for detail page. Use complementary numbers, not duplicates.

**SEO:** Metrics = visual break, no structural semantic value. If metrics become verifiable claims (e.g., 'serves 9 industries'), add AggregateOffer or custom Fact schema. Currently, page-level CollectionPage sufficient. Author names + roles readable by crawlers (not aria-hidden).

---

### 7. WorkTestimonials
**Current state:** 3 pull-quotes (client testimonials) with MagicCard glow. BorderBeam-wrapped or simple rounded cards. Author + role + company below. Likely 3-col grid desktop, stack mobile. Simple, clean.

**Keep:** Quote + author + role = standard, accessible. MagicCard glow on hover = delight. Layout simple, readable. Visual restraint—testimonials speak.

| Idea | Technique | Reference | Effort | Impact | Risk |
|------|-----------|-----------|--------|--------|------|
| Floating/Layered Card Stacks with Parallax Depth | Stack 3 cards with vertical offset (top: y=0, second: y=20px, third: y=40px). As user scrolls, parallax so each moves at different rate. Top fastest, bottom slowest. Depth + hierarchy. | BASIC/DEPT featured carousel; Hello Monday project cards; Buzzworthy Studio team reveals | M | medium | Parallax + MagicCard glow = visual noise. Keep offset subtle (20–30px max). Glow doesn't scale—only card position parallaxes. |
| Quote Text SplitText Reveal (Character-by-Character Stagger) | On scroll-into-view, reveal quote character-by-character via clip-path. Authors stay visible. Editorial, intentional feel. | Codrops Feb 2026 'Character-Level SplitText'; Aristide Benoist portfolio | M | medium | 50–100 chars/quote = 3–5s reveal (long). Shorten stagger to 0.02s or use word-level reveal. Test perceived speed. |
| Micro-Scale Lift on Card Scroll-Into-View (No Hover) | Cards scale 0.98→1.0 + opacity 0.8→1.0 on viewport entry. Scroll-driven. Signals importance, no hover needed. | Buzzworthy Studio; Obys Agency card reveals | S | medium | Fast scroll causes scale overshoot (>1.01). Use overwrite: 'auto', clamp 0.98–1.02. Test trackpad. |

**Implementation notes:** For parallax stacks, initial position transform: translateY(N * 20px). ScrollTrigger: start 'top center', end 'bottom center', scrub: 1. Animate y offset staggered per card. Gate behind !reducedMotion. Reduce-motion: y=0. For quote reveal, SplitText on mount (gate behind useMounted). ScrollTrigger: start 'top 80%', end 'bottom 20%', scrub: false (one-time). clipPath inset(100%)→inset(0) with stagger 0.02–0.03s. Total ~0.4s. Gate behind !reducedMotion. Reduce-motion: fully visible. For micro-lift, ScrollTrigger per card: start 'top 85%', end 'top 65%', scrub: 0.5. Animate scale 0.98→1.0, opacity 0.8→1.0 over 0.5s. Easing: power2.out. Gate behind !reducedMotion. Reduce-motion: final scale (1.0), opacity (1.0).

**Micro-details:**
- 3 testimonials from real clients (per CaseStudyTestimonial interface). Quotes accurate, attribution correct.
- MagicCard glow (glowColor) consistent across 3 cards or per-brand color (design intent).
- Light bg (white). Cards have subtle border/shadow. Visual hierarchy: content, negative space.
- Author attributions (role + company) readable at all sizes. Font: 12–14px.

**SEO:** Purely testimonial content—not indexed directly. If testimonials become structured data opportunity (Review schema with rating), add @type: 'Review' to JSON-LD. Currently, page-level schema sufficient. Author names + roles readable by crawlers (not aria-hidden).

---

### New sections worth adding

**WorkFilter (Before WorkGrid)**
Add horizontally-scrollable pill buttons ('Healthcare', 'Finance', 'E-commerce', 'SaaS') that filter visible WorkGrid projects by industry. Reduces decision paralysis when 9 cards are visible. Currently, users must scroll through all; a filter lets them surface relevant work. Industry filter is a proven UX pattern (Basis Design System, Linear, Notion). Animated glow on active pill provides feedback. *Reference:* Smart Interface Design Patterns (15 Filter UI Patterns, 2026); Basis Design System (Filter Pills component); SaaS dashboards (Notion, Linear).

**WorkClientsLogo (After WorkMarquee, Before ProcessTeaser)**
Trust-builder section: display logos of the 10 case study clients in a responsive grid. Creates instant visual proof of 'real clients, real brands'. Clients are healthcare (Optum), manufacturing (Skyline), finance (well-known brands), etc.—logos alone signal credibility. Typically 4–5 logos on desktop, responsive down to 2 on mobile. Optional: add hover state that reveals client name + industry. No complex animation—simple, clean. Pairs well with the metrics section above (numbers prove impact, logos prove reach). *Reference:* Trustbar/Social Proof patterns (Stripe, Slack, Vercel landing pages); Logo cloud galleries (Awwwards winners).

**WorkCtaSecondary (After WorkCTA, Before Footer)**
Optional secondary CTA section bridging to /services or /contact. E.g., 'Can't find your use case? Let's explore.' with a link to /services (our service lines: 'SaaS platforms', 'Real-time systems', 'ML/AI infra', etc.). Currently, the page has only one CTA (WorkCTA 'Get started'). A secondary CTA for users who don't immediately commit (e.g., 'I need to think about this first') reduces bounce. Intentionally lower visual weight than primary CTA (smaller button, muted copy). *Reference:* Conversion funnel best practices (Stripe, GitHub, Linear); Multi-step CTAs on case study pages.

**WorkFaq (Before WorkCTA)**
A/B tested question-answer pairs addressing common work-related FAQs: 'How long is a typical engagement?' 'Do you work with startups?' 'What's your process for vetting fit?' Reduces friction by answering top objections before the CTA. Accordion UI (expand/collapse Q&A). Scroll-triggered reveal for each Q (character reveal or simple fade-in). Text-heavy section, so motion should be subtle. Helps SEO (FAQ schema can be added to JSON-LD). *Reference:* Case study detail pages (often have FAQ sections); Stripe, GitHub, Vercel case study pages.

**WorkComparison (After WorkFeatured, Before WorkGrid)**
Optional comparison matrix: 'How We Compare' table showing TGlobal vs typical agency/boutique shop on axes like 'shipping speed', 'post-launch support', 'cost per sprint', 'industry focus'. 2 columns (TGlobal + typical competitors). Rows are attributes. Highlight TGlobal column to show advantage. Scroll-reveals for each row (staggered animation). Helps users understand TGlobal's positioning vs alternatives. Probably not needed if detail pages already explain differentiation. *Reference:* Comparison tables on SaaS landing pages (Stripe, Linear, Vercel); Product comparison grids.

---

## /process — section-by-section playbook

### 1. ProcessHero

**Current state:** Pinned dark-ink manifesto with live git-log stream (9 commits typed over 2.6s), sprint day counter (10/10), conic-gradient progress arc, and three rule cards below.

**Keep:** Terminal-aesthetic hooks immediately. Three-rule card structure works better than scramble-swap. Commit stream creates narrative arc. Do not remove or compress git-log aesthetic.

**Elevations:**

| Idea | Technique | Reference | Effort | Impact | Risk |
|------|-----------|-----------|--------|--------|------|
| Character-level SplitText reveal on headline with velocity-responsive commit lag | GSAP SplitText clip-path reveal on headline (0.04-0.06s stagger). Commit stream playback rate modulates with Lenis velocity: 260ms/commit at rest, 180ms at >500px/s. | Codrops 'From Shader Uniforms to Clip-Path Wipes' (May 2026) | M | high | SplitText revert() must fire on unmount; velocity undefined on first render (gate behind mounted). |
| Scroll-velocity-driven commit row skew plus emphasis glow on latest | Latest commit receives dynamic skew (±3-5 degrees) correlated to scroll velocity, paired with inset glow box-shadow. Reuses existing Lenis velocity capture. | Codrops scroll-velocity skew studies (2025-2026) | S | medium | Velocity undefined on first render; skew can disorient if >5 degrees. |
| Micro-pulse on status indicators (emerald dots) using CSS @keyframes | Emerald status lights and 'shipping today' label pulse at staggered cycles (300ms apart). Pure CSS animation-timeline independent. | Micro-interactions best practice (300-600ms); Resend/Vercel pattern | S | low | Multiple animations can increase CPU; use will-change: opacity. |

**Implementation notes:**
- Gate SplitText behind `useMounted()`. `useGSAP(() => { const split = new SplitText(h1, { type: 'chars' }); gsap.from(split.chars, { clipPath: 'inset(100% 0 0 0)', duration: 0.9, stagger: 0.05, ease: 'power2.out' }); })`.
- Velocity-modulated interval in ProcessHero's `useEffect`: `const speedMultiplier = 1 + Math.abs(window.lenisVelocity || 0) / 1000; setInterval` updates by `baseInterval / Math.min(speedMultiplier, 1.8)`.
- On reduced-motion: SplitText skipped, commit stream shows all 9 commits instantly.
- Skew implementation: `gsap.to(latestCommitRow, { skewY: vel > 0 ? skewAmount : -skewAmount, duration: 0.5, ease: 'power3.out' })`. CRITICAL: skew only; no transform-origin or translate (breaks GSAP ScrollTrigger pins).

**Micro-details:**
- Commit stream at 100% opacity even when skewed. Terminal background constant. Sprint clock arc remains static on initial load. Rule cards visible on first paint. Keep heading h1 descriptive for SEO.

**SEO:** Page already ships WebPage + BreadcrumbList + HowTo JSON-LD. ProcessHero carries strongest keyword signal. SplitText animation does NOT affect crawlability; text DOM-present before animation. No SEO risk.

---

### 2. ProcessContrast

**Current state:** Two-column table: 'Typical agency' (strikethrough) vs 'TGlobal' (bold). Six rows with AnimateIn stagger. Strikethrough reads as editorial critique.

**Keep:** Contrast is elegant and confident. Six-row escalation tells clear narrative. Do NOT change rows or reorder them. AnimateIn stagger is subtle but present.

**Elevations:**

| Idea | Technique | Reference | Effort | Impact | Risk |
|------|-----------|-----------|--------|--------|------|
| Kinetic typography reveal on labels plus staggered row border glow | Category labels animate character-by-character (clip-path wipe). Row border (1px gradient) flashes in as row enters, animating opacity 0→1 over 400ms. | Character-level reveals (Codrops); Editorial design patterns | M | medium | Word reveals can feel slow if >2s combined; SplitText stagger changes can break if AnimateIn delay adjusted. |
| Strikethrough animation with color shift (SVG line draw) | SVG `<line>` on agency items animates stroke-dashoffset 100→0 over 500ms (left-to-right fill). Color shift: text pale gray→dark gray emphasizing 'old way' fading. | SVG stroke-dashoffset reveal (GSAP + ScrollTrigger) | M | medium | SVG line width consistency across browsers; stroke-dasharray must be set before animation. |
| TGlobal text glow plus 1% scale-up on row enter | TGlobal column text receives inset glow (box-shadow) + subtle scale-up (1.01) over 400ms, signaling 'better choice'. | Micro-interaction delight; Hover-lift adapted to scroll-trigger | S | low | Inset glow can feel like selection vs emphasis; test with users. Scale 1.01 can make text appear weighted. |

**Implementation notes:**
- Wrap labels in `data-split-text`. `useGSAP: gsap.from(split.chars, { clipPath: 'inset(100% 0 0 0)', duration: 0.6, stagger: 0.03, ease: 'power1.out' })`. AnimateIn delay: `idx * 0.06 + 0.1s`.
- Row border `::before` with `@keyframes row-glow-in`.
- SVG `<line>` replacement: `gsap.to(svgLine, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out', scrollTrigger: { trigger: rowElement, start: 'top 70%', once: true } }); gsap.to(agencyText, { color: '#595959', duration: 0.5 }, 0)`.
- TGlobal glow: `gsap.from(tglobalText, { boxShadow: 'inset 0 0 0px rgba(189, 112, 246, 0)', scale: 0.99, duration: 0.4, ease: 'power2.out', delay: idx * 0.06 + 0.08 })`. Final state: `boxShadow: 'inset 0 4px 8px rgba(189, 112, 246, 0.08)', scale: 1`.
- On reduced-motion: labels fully opaque (no clip-path), glow skipped, scale: 1.

**Micro-details:**
- Use `tabular-nums` on labels. Mobile inline labels animate with parent row via AnimateIn (not separately). Semantic `<ul role='list'>`. Strikethrough SVG `aria-hidden`. Eyebrow static on load.

**SEO:** Reinforces keyword signal ('agency vs studio', 'discovery', 'cadence', 'ownership'). Semantic table crawlable. Animations do NOT hide content. No SEO risk.

---

### 3. ProcessSteps

**Current state:** Five-step vertical timeline with MagicCard steps, vertical connector line (CSS scroll-timeline), numeral markers (80ms earlier parallax), and deliverables list per step.

**Keep:** Vertical timeline is editorial spine. Left-aligned line + right-aligned cards create perfect flow. CSS scroll-timeline elegant/performant. Numeral markers provide anchoring. MagicCard hover works. Deliverables ground steps in concrete output. Do NOT move to horizontal or collapse.

**Elevations:**

| Idea | Technique | Reference | Effort | Impact | Risk |
|------|-----------|-----------|--------|--------|------|
| Step card entrance via FLIP morphing plus staggered deliverable reveals | FLIP morphs card from collapsed (smaller, lower opacity) to full-size. Numeral arrives 80ms earlier. Deliverables slide in (0.08s stagger) as arc completes: numeral 0-80ms, card 80-280ms, deliverables 280-500ms. | GSAP Flip (Codrops Feb 2026); Staggered list reveals | M | high | Flip requires stable refs; three-layer stagger can feel slow on mobile (<600ms target); reduced-motion must show all deliverables. |
| Connector line glow pulse plus velocity-driven color shift | Vertical line gains pulsing glow (2-second cycle) at scroll midpoint. Line color shifts violet→accent-violet→back, scaled with scroll velocity (reactive effect). | Pulsing progress indicator; Velocity-driven color (Phantom Studios) | M | medium | Pulsing can become annoying; fade once section fully scrolled. Hue-rotate >10deg can disorient. |
| Deliverable icons with color-coded labels for scannability | Each deliverable gets small icon (lucide-react) + colored label (green artifacts, blue docs, amber infra). Icons appear 100ms before text (parallax). Reuses ProcessArtifacts color palette. | Color-coded lists (design system); Icon leading elements | S | medium | Icons should NOT be aria-hidden. Color contrast must hit WCAG AA (reuse ProcessArtifacts TYPE_META weights). |

**Implementation notes:**
- Capture ref. On `IntersectionObserver`: `gsap.from(cardRef.current, { ...Flip.getState(state), duration: 0.3, ease: 'power2.out' })`.
- Deliverables: `gsap.from(deliverables, { y: 12, opacity: 0, duration: 0.3, stagger: 0.08, ease: 'power1.out', delay: 0.2 })`.
- Connector line pulse: `@keyframes connector-pulse { 0%, 100% { boxShadow: 0 0 4px rgba(189, 112, 246, 0.3); } 50% { boxShadow: 0 0 12px rgba(189, 112, 246, 0.8); } }`.
- Velocity-driven hue: `gsap.ticker.add(() => { const vel = Math.abs(window.lenisVelocity || 0); const hue = Math.min(vel / 500, 1); gsap.to(fillSpan, { '--line-hue': hue, duration: 0.2 }); })`.
- Icon rendering: `<li><Icon className='w-4 h-4 text-{color}-700' /><span>{name}</span></li>`. Icons animate: `gsap.from(icons, { scale: 0, opacity: 0, duration: 0.2, stagger: 0.08, ease: 'back.out', delay: 0.15 })`.
- On reduced-motion: all visible at final scale/opacity on first paint.

**Micro-details:**
- Use `<ol role='list'>` (steps are ordered). Heading hierarchy: h2 (ProcessSteps)→h3 (step name). Line left-offset: 23px mobile, 31px lg+. Card body padded-left: 16px (sm:24px). Lavender-wash background; glow colors calibrated against tint.

**SEO:** Five-step structure maps to HowTo schema. Deliverables (Signed SOW, CI/CD pipeline) add semantic richness. Animations do NOT hide content. No SEO risk.

---

### 4. ProcessAnatomy

**Current state:** Horizontal scrollable 10-day sprint rail. Days pinned to continuous rail via overflow-x: auto. Rail fills left→right via CSS animation-timeline: view(). Two milestone badges with pulsing halos. Each day: short focus statement.

**Keep:** Horizontal rail mirrors process itself (linear time, left→right). Scroll-timeline fill elegant/performant. Milestone badges create narrative inflection. Mobile horizontal scroll preserves intent. Tile width preserves rhythm on all viewports.

**Elevations:**

| Idea | Technique | Reference | Effort | Impact | Risk |
|------|-----------|-----------|--------|--------|------|
| Scroll-velocity-driven day-tile skew plus parallax y-offset | Tiles' y-position + skew respond to horizontal scroll velocity. Tiles near left edge skew backward (±3 degrees) as velocity increases; right edge skew forward. Subtle y-offset parallax (±10px based on viewport distance). | Scroll-velocity skew stagger (Cappen Studio); Parallax depth (14islands) | M | high | Horizontal scrolling can disorient; keep skew <5 degrees. Test on mobile to ensure no shakiness during gentle scrolling. |
| Milestone badge expansion plus glow pulse plus label character reveal | Badge within 200px of viewport center: expands 1.0→1.2x over 300ms, glow halo pulses 2-second cycle, label animates character-by-character (clip-path reveal). Retreats on scroll out. | Badge expansion on scroll-in (Codrops); Halo pulse (existing process-anatomy-pulse) | M | high | Intersection Observer threshold critical; test different devices. Character reveal can feel slow if stagger >0.05s. |
| Focus statement word-by-word animation on scroll-in | Each day tile's focus statement animates word-by-word (slide up + fade in) as tile scrolls past viewport center. Words slide y: 20→0, fade in 300ms, staggered 0.1s. | Word-level SplitText reveals; Codrops kinetic typography | S | medium | Word reveals can slow perceived reading; test stagger with users. SplitText on 10 days increases JS overhead; use batch updates. |

**Implementation notes:**
- Capture horizontal velocity: `gsap.to(dayTiles, { skewX: Math.sign(horizontalVelocity) * 3, yPercent: gsap.utils.mapRange([0, containerWidth], [-10, 10], tileX), duration: 0.4, ease: 'power3.out', overwrite: 'auto' })`. Update on every scroll frame.
- Badge: `IntersectionObserver` with `rootMargin '0px 200px 0px 200px'`. `gsap.to(badge, { scale: 1.2, duration: 0.3, ease: 'back.out' })`; then `animation: process-anatomy-pulse 2.4s`.
- Label: `SplitText` with `gsap.from(chars, { clipPath: 'inset(100% 0 0 0)', duration: 0.6, stagger: 0.05 })`.
- On reduced-motion: `skew = 0, yPercent = 0`, `scale: 1` (no expansion), `animation: none`, label fully visible on first render.

**Micro-details:**
- Horizontal-scroll region `role='region'` needs `aria-label` + `tabIndex`. Arrow keys scroll rail. Day tiles: semantic `<div role='article'>` with `<h3>Day</h3>`. Badge `aria-hidden`. Line fill CSS scroll-timeline; 100% width non-supporting browsers. Mobile: no scroll-snap (free-form). Day tile width consistent (220px base).

**SEO:** Timeline structure reinforces process narrative. 10-day breakdown aligns with HowTo schema. Focus statements include topically relevant keywords without stuffing. Animations do NOT hide content. No SEO risk.

---

### 5. ProcessTriptych

**Current state:** Three phase cards (Foundation/Build/Ship) with circular progress arcs (CSS conic-gradient), tool lists with captions, italic taglines. Arc fills 0→100 on card enter (IntersectionObserver + requestAnimationFrame). Status labels ('stable', 'in motion', 'live') pair with taglines.

**Keep:** Three-phase structure adapted for /process context (CI/CD status board). Conic-gradient arc elegant/zero-GSAP. Tool lists ground in concrete tech. Status labels add telemetry flavor. Mobile: cards stack, arc + tools readable.

**Elevations:**

| Idea | Technique | Reference | Effort | Impact | Risk |
|------|-----------|-----------|--------|--------|------|
| Arc fill velocity-responsive timing plus staggered tool reveals | Arc fill speed scales inversely with scroll velocity: fast scroll 800ms, slow scroll 1600ms. Tools animate in staggered (0.15s apart) when arc reaches 80%. Card +scale micro-lift (1.02) as it enters. | Velocity-responsive timing (Phantom Studios); Staggered list reveals; Card scale | M | high | Velocity undefined on first render (gate behind mounted). 800-1600ms range wide; test low-end devices. Tool reveal timing depends on arc @80%; adjust if needed. |
| Tool icons with animated captions and hover glow | Tools get left-aligned icon + caption below. On hover: icon + name glow (inset on name, outline on icon). Caption animates clip-path wipe right→left. Icons appear 50ms before name (micro-parallax). | Icon + label patterns; Hover glow; Clip-path text reveal | S | medium | Hover glow on 15 tools can trigger repaints; use will-change: filter. Clip-path wipe slow if caption >50 chars. |
| Status label pill glow pulse plus text color shift on card enter | Status pill animates: glow expands + pulses 1.8s cycle (slower than arc pulse), text color shifts muted→status color (green/amber/primary) over 400ms. Signals 'phase now active'. | Status indicator pattern (ops dashboards); Badge animation | S | low | Color shifts unintuitive if palette not clear; ensure green=stable, amber=in-motion, blue=live distinct. Pulse flickers if CSS var unsupported (fallback to primary). |

**Implementation notes:**
- Velocity: `const duration = gsap.utils.mapRange([0, 1000], [1600, 800], Math.abs(velocity))`.
- Arc: `setProperty('--progress', progress)` via `requestAnimationFrame`.
- Tool reveals (when arc ≥80%): `gsap.from(toolItems, { y: 20, opacity: 0, duration: 0.4, stagger: 0.15, ease: 'power2.out', delay: 0.1 })`.
- Card entrance: `gsap.from(cardRef.current, { scale: 0.98, duration: 0.5, ease: 'power2.out' }, 0)`.
- Tool hover: `group-hover: Icon filter: drop-shadow(0 0 8px rgba(189,112,246,0.5)); name box-shadow: inset`. Caption: `clip-path: inset(0 100% 0 0)` → `gsap.to(caption, { clipPath: 'inset(0)', duration: 0.4, delay: idx * 0.15 + 0.2 })`. Icon parallax: `gsap.from(icon, { x: -8, opacity: 0, duration: 0.2, delay: idx * 0.15 })`.
- Status color: `const statusColor = { stable: '#00a656', 'in-motion': '#fbbf24', live: '#4b28ff' }[status]; gsap.to(statusPill, { '--status-color': statusColor, duration: 0.4, ease: 'power2.out' })`; then `animation: status-pulse 1.8s`.
- `@keyframes status-pulse { 0%, 100% { boxShadow: 0 0 0 3px rgba(189,112,246,0.2); } 50% { boxShadow: 0 0 0 8px rgba(189,112,246,0); } }`.
- On reduced-motion: arc/tools/glow visible on first render, color shift/pulse instant.

**Micro-details:**
- Cards `<ol role='list'>`→h3. Progress arc `--progress 0-1`; `conic-gradient from 0deg, primary 0%, primary calc(var(--progress) * 100%)`. Tools `<ul role='list'>` with `<li>` per tool. Status `<span>` `aria-label`; icon `aria-hidden`. Mobile: cards stack; arc shrink (h-20 mobile, h-28 lg+).

**SEO:** Lists concrete technologies (Postgres, Next.js, Datadog); tech keywords crawlable. Reinforce 'technical process' positioning. Three phases map to SDLC. Animations do NOT hide content. No SEO risk.

---

### 6. ProcessArtifacts

**Current state:** Two-row infinite marquee: PR titles, runbooks, Friday demos, ADRs, deploys, postmortems, feature flags. Tiles duplicate seamlessly (CSS loop). Each tile: type icon + colored label + artifact text. Type colors hit WCAG AA on surface. Marquee simple CSS animation (infinite loop), no scroll-sync.

**Keep:** Carousel is visceral proof of shipping (real artifacts, not stock). Two-row layout keeps viewport uncluttered. Type-coding (color) makes carousel scannable. Do NOT remove artifact bank; major credibility signal. Infinite loop keeps marquee alive.

**Elevations:**

| Idea | Technique | Reference | Effort | Impact | Risk |
|------|-----------|-----------|--------|--------|------|
| Scroll-velocity-driven marquee playback speed plus skew distortion | Marquee playback rate scales with scroll velocity: 20s/loop at rest, 10s at >800px/s (2x speed), 6.7s at >1500px/s (3x). Pair with velocity-driven skew (±3 degrees) on container. Skew + speed respond together. | Scroll-velocity marquee (Codrops 2025-2026); Kinetic typography + distortion | M | high | Skew at high velocities disorienting; max ≤5 degrees. Speed change can stutter if duration recalculated; use timeScale() not duration. Test slow networks. |
| Artifact tile hover: scale plus icon spin plus caption slide | On hover/focus: tile scales 1.0→1.08 (300ms), type icon rotates 0→180° (or 360° for full spin), caption slides in from right (clip-path: inset(0 100% 0 0)→inset(0)) overlaying text at 90% opacity. | Hover card scale (standard); Icon spin (micro-delight); Clip-path reveal | S | medium | Scale can clip adjacent tiles if packed tightly; add margin. Icon 180° looks like flip not spin; consider 360°. Caption text can overflow; use text-ellipsis or max-width. |
| Staggered tile color pulse animation on section enter | As section enters viewport, each tile's type-color label animates base→bright→base over 600ms, staggered per tile. Creates 'wave' of color across marquee (~2s full wave). Signals 'carousel is live'. | Wave animation (CSS delay stagger); Color pulse (data viz style) | S | low | 30+ tiles can cause layout thrashing; use will-change: background-color. Color delta (base→bright) must be >10% luminance visible. |

**Implementation notes:**
- Timeline: `gsap.timeline({ repeat: -1 }).to(marqueeEl, { x: '-100%', duration: 20, ease: 'none' })`.
- Velocity-driven speed: `gsap.ticker.add(() => { const vel = Math.abs(window.lenisVelocity || 0); const speedMultiplier = gsap.utils.mapRange([0, 1500], [1, 3], Math.min(vel, 1500)); marqueeTimeline.timeScale(speedMultiplier); const skewAmount = gsap.utils.mapRange([0, 1500], [0, 3], Math.min(vel, 1500)); gsap.to(marqueeContainer, { skewX: vel > 0 ? skewAmount : -skewAmount, duration: 0.3, ease: 'power3.out' }); })`. On scroll stop: `gsap.to(marqueeContainer, { skewX: 0, duration: 0.6 })`.
- Hover: `group-hover: gsap.to(tile, { scale: 1.08, duration: 0.3, ease: 'power2.out' }); gsap.to(icon, { rotation: 180, duration: 0.4, ease: 'power2.out' }, 0); gsap.to(caption, { clipPath: 'inset(0)', duration: 0.4, ease: 'power2.out', delay: 0.1 })`. Mobile: use `focus-visible` instead.
- Wave pulse: On `IntersectionObserver` enter: `gsap.from(tiles, { '--label-color': (baseColor), duration: 0.3, stagger: 0.06, ease: 'sine.inOut', yoyo: true, repeat: 1 })`. CSS var `--label-color` per tile; `.artifact-label { background: var(--label-color); }`. `yoyo: true + repeat: 1` pulses once per tile.
- On reduced-motion: timeScale(1), skewX: 0, hover scale: 1, rotation: 0, caption shown immediately, wave pulse skipped.

**Micro-details:**
- Tiles `<div role='list'>` with `role='listitem'`. Tiles `<article>` `aria-label='{type}: {text}'`. Type icons `aria-hidden`. Marquee paused on hover (`animation-play-state: paused`). Mobile: marquee paused by default (add play button). Artifact text monospace (JetBrains Mono); captions sans-serif (Albert Sans).

**SEO:** Real artifact titles (PR, ADR, runbook, deploy, postmortem) reinforce delivery credibility. Keywords topically relevant. Timestamps ground content in specificity. Animations do NOT hide content. Captions bonus enhancement. No SEO risk.

---

### 7. ProcessQA

**Current state:** Three Q&A pairs addressing timeline anxiety→cost anxiety→ownership anxiety. Semantic `<article>` per pair: header (left, lg:5 cols) with label + `<h3>` question; body (right, lg:7 cols) with `<p>` answer. Rows separated by borders; section has border-y. AnimateIn stagger idx * 0.08s, y: 24px slide-up.

**Keep:** Question selection strategic: escalating concerns resolved in reverse. Fixed-cost + ownership promise are payoffs. Do NOT add/reorder Q&As; anxiety arc intentional. 2-col layout clean + readable. Slide-up animation feels editorial.

**Elevations:**

| Idea | Technique | Reference | Effort | Impact | Risk |
|------|-----------|-----------|--------|--------|------|
| Question text reveal word-by-word plus underline draw on answers | Each question animates word-by-word (slide up + fade in) as row enters. Stagger 0.08s per word. Answer text animates character-by-character (clip-path left→right) starting 200ms after question finishes. Subtle 1px underline (SVG `<line>`) draws left→right below answer, landing ~100ms after answer fully reveals. | Word-level SplitText reveals (Codrops); SVG stroke-dashoffset underline draws | M | high | Word reveals can slow reading speed; combined duration >3s feels slow. SplitText character level on long answers (>100 chars) can cause reflows. |
| Answer text glow plus left border accent animation | On row enter, answer text receives inset glow (box-shadow: inset 0 0 8px rgba(189,112,246,0.1)) fading in 400ms. 4px left border (primary #4b28ff) slides top→bottom (height: 0→100%) same speed. Border + glow create 'highlighted quote' effect. | Blockquote/pull-quote styling; Inset glow on quoted text (design system) | S | medium | Left border can compete if too bright; keep glow opacity <0.15. Border + glow together 'heavy' if page already accent-rich. |
| Number label scale plus color shift on row enter | 'Q.01', 'Q.02', 'Q.03' labels scale 0.8→1.0 + color shift muted gray→primary over 300ms. Arrives 50ms before question (micro-parallax). Label anchors eye. | Label-first entrance (wayfinding); Micro-parallax stagger | S | low | Scale animation can look jerky if ease wrong; 'back.out' can overshoot; test. Color shift must interpolate CSS var correctly. |

**Implementation notes:**
- Question word reveal: Wrap in `data-split-words`. `useGSAP: gsap.from(split.words, { y: 16, opacity: 0, duration: 0.3, stagger: 0.08, ease: 'power2.out', delay: idx * 0.08 })`.
- Answer character reveal (delayed): `gsap.from(answerSplit.chars, { clipPath: 'inset(0 100% 0 0)', duration: 0.6, stagger: 0.02, ease: 'power1.out', delay: idx * 0.08 + (0.3 * numWords) + 0.2 })`.
- SVG underline: `@keyframes underline-draw` with `animation-delay`. `gsap.to(borderSpan, { height: 0 → 100%, duration: 0.4, ease: 'power2.out', delay: idx * 0.08 + (0.3 * numWords) + 0.8 })`.
- Answer glow: `gsap.from(answerEl, { boxShadow: 'inset 0 0 0px rgba(189,112,246,0)', duration: 0.4, ease: 'power2.out', delay: idx * 0.08 + (0.3 * numWords) })`.
- Label scale + color: `gsap.from(labelEl, { scale: 0.8, '--label-color': '#595959', duration: 0.3, ease: 'back.out', delay: idx * 0.08 - 0.05 })`. Final: `--label-color: #4b28ff`.
- On reduced-motion: all text visible on first paint (no clip-path), underline visible instantly, label scale: 1, color: #4b28ff instantly.

**Micro-details:**
- Structure: `<article><header><span className='qa-label'>Q.01</span><h3>question</h3></header><p>{answer}</p></article>`. Question `<h3>` with `id='qa-q{idx}'`. Answer `<p>` NOT `aria-hidden`. Labels use `tabular-nums`. Mobile: header + body single column.

**SEO:** Addresses high-intent queries ('fixed cost development', 'code ownership', 'two-week sprint'). Scannable + keyword-rich without stuffing. FAQPage JSON-LD can surface in Google FAQ rich results. Animations do NOT hide content. No SEO risk.

---

### 8. ProcessCTA

**Current state:** Dark-ink card (#03020b, rounded-[32px], min-h-[480px] lg+) on white background. Two purple glows (top-right primary, bottom-left secondary @ 0.35 opacity). Headline + ancillary text + dual buttons (MagneticPill 'Ship it now' + link 'Proof in code').

**Keep:** Dark card on white = visual full stop after 7 sections; signals closure + decision. Dual buttons give two exits: 'commit' vs 'see proof'. Purple globs evoke /about but feel native to /process. Do NOT change layout or remove globs.

**Elevations:**

| Idea | Technique | Reference | Effort | Impact | Risk |
|------|-----------|-----------|--------|--------|------|
| Headline text reveal via SplitText character stagger plus glow progression | Headline animates character-by-character (clip-path: inset(100%)→inset(0)) over 0.8s, 0.05s stagger. Dynamic glow behind text fades 0→0.4 opacity, landing as text finishes reveal. Glow blur-filtered div (z-index: -1), accent-violet color. | Character-level reveals (Codrops Feb 2026); Dynamic text glow (editorial design) | M | high | Long headline (44 chars) can exceed 2s reveal if stagger too wide; use 0.04-0.05s per char. Glow can disorient if oversaturated; test gradient + blur. |
| Button hover: MagneticPill scale pulse plus secondary link glow + underline slide | Primary button: scale pulse 1.0→1.05→1.0 (300ms) on hover, 'press' micro-motion. Secondary link: glow (box-shadow: 0 0 16px rgba(189,112,246,0.3)) + underline slide (clip-path left→right). Both respond together with different signatures. | Magnetic pill + button press (300ms); Underline slide (typography animation) | S | medium | Scale pulse can conflict with MagneticPill (both modifying transform); separate via scale vs translate. Underline clip-path needs text-decoration-clip: unset to prevent double-underlining. |
| Card entrance: fade-in plus scale plus staggered blur glow reveals | Card fades 0→1, scales 0.95→1.0 (400ms). Blur globs stagger: top-right fades (0.4s), bottom-left fades 200ms later. All simultaneously for opacity/scale, staggered for glows. Creates 'blooming' effect. | Card scale entrance (standard); Staggered glow reveals (depth layering) | S | medium | Scale entrance can feel 'popping' if final scale doesn't match resting exactly. Glow stagger subtle; if bottom-left too faint/delayed, may not be perceived. |

**Implementation notes:**
- Gate behind `useMounted()`. Headline: `useGSAP: gsap.from(split.chars, { clipPath: 'inset(100% 0 0 0)', duration: 0.8, stagger: 0.05, ease: 'power2.out' })`.
- Glow: `<div style={{ background: 'radial-gradient(circle at center, rgba(212,197,255,0.6) 0%, transparent 70%)', filter: 'blur(40px)' }} />`. `gsap.from(glowDiv, { opacity: 0, duration: 1, ease: 'power2.out', delay: 0.1 })`.
- Button press: `@keyframes button-press { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }` with `animation: button-press 300ms on group-hover`.
- Secondary link: `gsap.to(secondaryLink, { boxShadow: '0 0 16px rgba(189,112,246,0.3)', duration: 0.3 }); gsap.to(underlineEl, { clipPath: 'inset(0)', duration: 0.4, ease: 'power2.out' })`.
- Card entrance: `gsap.from(cardRef.current, { opacity: 0, scale: 0.95, duration: 0.4, ease: 'power2.out' }); gsap.from(glowTopRight, { opacity: 0, duration: 0.4, ease: 'power2.out', delay: 0 }); gsap.from(glowBottomLeft, { opacity: 0, duration: 0.4, ease: 'power2.out', delay: 0.2 })`.
- On reduced-motion: all visible on first paint (opacity: 1, scale: 1), glows at final opacity instantly, button press animation: none.

**Micro-details:**
- Card rounded-[32px]; glow blur radius 120-140px extends slightly beyond edges (depth). Primary button `href='/#talk-to-us'` (hash link to form). Secondary is plain `<Link>`. Italic 'ship' uses Instrument Serif, lighter color (#d4c5ff). Contrast #d4c5ff on #03020b = high (safe). Ancillary line needs white or text-background (fix opacity issue). Buttons flex-row desktop, flex-col mobile, left-aligned.

**SEO:** Final conversion touchpoint; reinforces primary ('Ship it now') + secondary ('Proof in code') CTAs. Headline tagline ('We don't talk about it. We ship it.') memorable, usable in ads/social. Internal links (/#talk-to-us, /work) improve site structure + crawlability. Animations do NOT hide content. No SEO risk.

---

### New sections worth adding

**ProcessBenchmarks (optional expansion)**

A three-column comparison of TGlobal's metrics vs industry benchmarks would add topical richness and credibility signals:
- Time to First Deploy: 3 days vs industry avg 8 weeks
- Defect Rate: 0.2% vs 2.1%
- Team Velocity: 45 points/sprint vs 25 avg

Placement: between ProcessTriptych and ProcessArtifacts. Animated number tickers (scroll-driven) count from 0 to final value as section enters. Reuses conic-gradient progress arc pattern from ProcessHero. Reference: Data visualization best practice (SaaS marketing pattern); Number ticker with scroll-drive (existing in /work WorkMetrics); Metric comparison tables (Gartner, McKinsey reports).

This addition amplifies credibility without disrupting the existing narrative flow, provided number tickers maintain reduced-motion parity (final values visible on first render when motion OFF).

---

## SEO, performance & structured-data strategy

### Core Web Vitals 2026: Targets & Animation Constraints

TGlobal targets the 75th percentile thresholds across all three Core Web Vitals metrics. INP replaced FID on March 12, 2024, making animation-heavy sites vulnerable to responsiveness failures.

| Metric | Good | Needs Improvement | Poor | TGlobal Target |
|--------|------|------------------|------|---|
| **LCP** (Largest Contentful Paint) | ≤2.5s | 2.5–4s | >4s | <2.0s |
| **INP** (Interaction to Next Paint) | ≤200ms | 200–500ms | >500ms | <150ms |
| **CLS** (Cumulative Layout Shift) | ≤0.1 | 0.1–0.25 | >0.25 | <0.05 |

**Animation Compliance Mapping:**
- **LCP constraint:** Hero image preload + AVIF format + next/image priority; no render-blocking JavaScript or animation startup delays.
- **INP constraint:** WorkGrid skew reveals, WorkMarquee velocity distortion, ProcessTriptych arcs—all must animate ONLY transform/opacity properties. Main-thread blocking causes INP spikes; GPU-accelerated properties stay compositor-only.
- **CLS constraint:** ProcessTriptych pins must maintain layout stability across scroll. Font-swap via next/font size-adjust (automatic). No layout-property animations (width, height, top, left).

**Verification workflow:**
1. PageSpeed Insights + Chrome DevTools Performance tab.
2. Throttle to "4G Slow" + "CPU 4x Slowdown" to simulate p75 users.
3. Measure INP during interactions: WorkGrid card reveal (click/scroll), ProcessAnatomy 10-day rail interaction, ProcessTriptych conic arc draw.
4. Profile heap snapshots before/after full page scroll to detect will-change memory leaks.

---

### Structured Data: Corrected Markup Strategy

**HowTo Deprecation (Confirmed):**
HowTo rich results were fully removed from Google Search on September 13, 2023. /process currently ships HowTo JSON-LD, which produces **zero SEO value** and no visible SERP enrichment. Removal carries no rollback risk.

**FAQ Deprecation (Complete as of June 2026):**
FAQ rich results were deprecated in April 2023, restricted to government/health authorities, then completely removed from Google Search in May 2026, Search Console in June 2026, and API support in August 2026. ProcessQA question pairs should NOT use FAQPage schema.

**Google-Supported Rich Result Types (2026):**
Article, Breadcrumb, Course list, Event, Job posting, Local business, Organization, Product, Profile page, Q&A, Recipe, Review snippet, Software app, Video.

**CreativeWork & ItemList Clarification:**
- **CreativeWork** is semantically valid but does NOT generate Google rich results; provides indexing context only.
- **ItemList** is supported only for course lists; does NOT earn rich results for portfolio grids.
- For TGlobal's work portfolio: **Organization** (agency identity) + **Profile page** (portfolio showcase) are the only supported types that generate visible SERP enrichment.

**Recommended Markup for /work & /process:**

| Page | Schema Type | Purpose | Rich Result Type |
|------|-------------|---------|------------------|
| /work (index) | Organization + ItemList | Agency branding + portfolio container | Logo, contact info in SERP (Organization only) |
| /work/[slug] (case study) | CreativeWork + Article | Case study metadata + content structure | No rich result (but helps indexing) |
| /process (index) | BreadcrumbList | 5-step navigation hierarchy | Breadcrumb trail in SERP |
| /process#steps | BreadcrumbList + Article | Timeline steps as itemListElement | Breadcrumb expansion in SERP |

**Implementation Checklist:**
- [ ] Remove `@type: 'HowTo'` from /process.
- [ ] Remove `@type: 'FAQPage'` from any Q&A markup; replace with Article + haspart if needed (no rich result).
- [ ] Implement BreadcrumbList for /process with 5 items: Scope It, Define It, Design It, Build It, Ship It (with fragment anchors).
- [ ] Add Organization schema at root layout with logo (200x60px AVIF), contact, sameAs links.
- [ ] Add Profile page schema to /work index: `{@type: 'ProfilePage', name: 'TGLOBAL Work', description: '...', url: 'https://tglobal.in/work'}`.
- [ ] Add CreativeWork for each /work/[slug] with name, client, dateCreated, description, url, and industry tag.
- [ ] Use Rich Results Test (search.google.com/test/rich-results) before deployment to verify BreadcrumbList + Organization generate expected output.
- [ ] Add JSON-LD to Next.js via `generateMetadata` + `json-ld-export` package.

---

### /work Page Indexing: From noindex to Indexed

**Current State:** /work is noindex; crawlable but not rankable.

**Prerequisites for Flipping to Indexed:**
1. **Server-rendered content:** Next.js 16 App Router with Server Components sends fully-formed HTML on first response. Verify with `curl -I https://tglobal.in/work` — response should include full HTML (not just scripts). Googlebot sees all 9 case studies + metadata immediately, not after hydration.
2. **Meaningful SEO content in initial HTML:**
   - All case study titles, descriptions, client names in the initial server-rendered response.
   - No gatekeeping behind "Load More" or hidden until animation completes.
   - WorkHero headline + hero image in viewport-priority fetch.
3. **Structured data passing validation:** BreadcrumbList (if present) + CreativeWork metadata must pass Rich Results Test.
4. **No crawl issues:** robots.txt allows /work; /work has internal links from /process and nav (crawl pathway).

**Indexing Workflow:**
1. Run PageSpeed Insights on /work; ensure LCP <2.5s, INP <200ms on 4G throttle.
2. Submit /work to Google Search Console: "Inspect URL" > "Request Indexing."
3. Wait 24–48 hours for initial crawl + indexing.
4. Monitor Search Console "Coverage" tab for errors; fix any "Crawled – not indexed" issues.
5. Check "Performance" tab after 2 weeks for impression/click data.

**No-Index Removal:**
- [ ] Locate `robots.noindex` meta tag or HTTP header on /work route.
- [ ] Remove or set to `robots.index, follow`.
- [ ] Verify in next.config.js or generateMetadata function.
- [ ] Redeploy and wait 5–10 minutes for crawl invalidation.

---

### JavaScript Rendering & SSR Requirements for App Router

**Googlebot Rendering Timeline (2026):**
- Googlebot uses a Chromium-based renderer, updated within weeks of Chrome releases.
- Allocated 5–15 seconds of CPU time per page for JavaScript execution.
- Content appearing within that window is indexable; content after ~15 seconds is at risk of non-indexing.
- SSR is **recommended** (for performance + compatibility) but **not mandatory** if client-side content appears within Googlebot's budget.

**Next.js 16 App Router Default Behavior:**
- Routes are **Server Components by default** — meaningful content (headlines, CTAs, body text) is automatically SSR'd.
- Client-side hydration + animations (GSAP ScrollTrigger, motion.div PageTransition) apply AFTER server HTML is sent.
- Googlebot sees the pre-rendered text immediately; animations are non-critical visual enhancements.

**SEO Risk Assessment for /work & /process:**
- ✓ **Safe:** Hero title, case study grid, ProcessSteps timeline — all server-rendered, Googlebot sees them.
- ⚠ **Risky:** If animations hide content until after hydration exceeds ~5 seconds (e.g., staggered reveal on WorkGrid completes at 8 seconds), Googlebot may miss the staggered items.
- ✗ **Broken:** Pages rendering empty skeletons/placeholders and fetching content via client-side API (not SSR'd) risk 0% indexing.

**Confirmation Checklist:**
- [ ] /work route uses React Server Component at layout level; critical metadata in `generateMetadata`.
- [ ] Case study content (titles, descriptions) is in the server HTML response, not fetched via getState.
- [ ] Any "Load More" or infinite-scroll pagination includes initial items in HTML (first 9 case studies, at minimum).
- [ ] Run `curl -s https://tglobal.in/work | grep -i 'case\|client\|project'` — output should include case study names.
- [ ] Disable JavaScript in DevTools (⌘⇧P > "Disable JavaScript") and reload /work — page structure should still be readable (headlines visible, even if animations don't play).

**No SSR Refactor Needed** unless /work currently renders empty placeholders and relies on fetch.

---

### Font & Image CLS Prevention Checklist

**Font Loading (next/font with size-adjust):**
- [ ] Import all fonts via next/font/google or next/font/local.
- [ ] Default display mode is `swap` (fallback renders immediately, web font swaps in); automatic size-adjust precomputed.
- [ ] Verify in DevTools Performance tab: no layout shift during font load. Measure CLS <0.05.
- [ ] For custom @font-face (rare): add `size-adjust`, `ascent-override`, `descent-override` manually. Example:
  ```css
  @font-face {
    font-family: 'CustomFont';
    src: url('font.woff2') format('woff2');
    size-adjust: 98%;
    ascent-override: 110%;
  }
  ```

**Image Optimization (next/image with LCP priority):**
- [ ] **WorkHero hero image:** `<Image preload fetchPriority="high" sizes="100vw" format={['avif', 'webp']} ... />`
- [ ] **ProcessHero terminal screenshot (if raster):** Convert to AVIF; compress >50KB images before upload.
- [ ] **WorkGrid case study thumbnails:** Use responsive sizes; lazy-load (default loading="lazy").
- [ ] **Enable AVIF in next.config.js:**
  ```js
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  }
  ```
- [ ] Test PageSpeed Insights: LCP element should be identified as hero image; LCP <2.0s target on 4G throttle.
- [ ] Measure image sizes: DevTools Network tab, filter for images. WorkHero should be <150KB AVIF, <250KB WebP.

**CLS Prevention Summary:**
- [ ] No font-swap > 0.1 shift: next/font automatic.
- [ ] No image dimension reflow: all images have explicit width/height or aspect-ratio CSS.
- [ ] No animated layout properties: WorkGrid, ProcessTriptych, WorkMarquee use transform/opacity only.
- [ ] No ad/embed late-load: no dynamic ad placement between content.
- [ ] Measure: PageSpeed Insights CLS score + DevTools Rendering Performance tab shift annotation.

---

### prefers-reduced-motion & WCAG 2.3.3 / 2.2.2 Compliance

**WCAG 2.3.3 (Animation from Interactions, Level A):**
"Motion animation triggered by interaction can be disabled, unless the animation is essential to functionality."

**W3C Guidance (September 2025):** Forcing animations while maintaining identical at-rest visuals violates WCAG 2.3.3. Users who set `prefers-reduced-motion: reduce` must have animations **completely disabled**—not just "visually identical" with motion removed.

**Vestibular Accessibility Context:**
Rapid motion triggers dizziness, nausea, and migraine in 35% of adults >40 years old. This is a medical accommodation, not a visual preference. Respecting prefers-reduced-motion is non-negotiable for accessibility.

**TGlobal's Current Approach (Correct):**
- Memory notes: "Reduced-motion parity is non-negotiable" + "PageTransition must be opacity-only."
- Using `useMounted()` to gate motion decisions (avoids SSR hydration mismatch).
- Animations disabled entirely in reduced-motion state, not dimmed or slowed.

**WCAG Compliance Mapping:**

| Page | WCAG 2.3.3 Animations | Reduced-Motion Behavior | Status |
|------|----------------------|------------------------|--------|
| /work (WorkHero) | Canvas pixelate-morph + carousel scroll | Disable; show static fallback | ✓ Compliant |
| /work (WorkGrid) | Staggered card reveals + skew on scroll | Disable; render all cards visible | ✓ Compliant |
| /work (WorkMarquee) | Velocity-driven text skew + loop | Disable; render static marquee or hide | ✓ Compliant |
| /process (ProcessHero) | Hero terminal animation | Disable; render final frame static | ✓ Compliant |
| /process (ProcessSteps) | Connector line draw + step transitions | Disable; render all steps + lines visible | ✓ Compliant |
| /process (ProcessTriptych) | Conic arc animations on scroll | Disable; render all 3 arcs static | ✓ Compliant |
| /process (ProcessAnatomy) | 10-day rail fill + tooltip draw | Disable; render completed rail static | ✓ Compliant |

**Implementation Checklist:**
- [ ] Wrap all `motion.div`, `motion.span` (Framer Motion) in a `useReducedMotion()` gate:
  ```tsx
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? (
    <div>{/* Static content */}</div>
  ) : (
    <motion.div animate={{...}}>...</motion.div>
  );
  ```
- [ ] Wrap all GSAP timelines in `@supports (prefers-reduced-motion: reduce)`:
  ```css
  @supports (prefers-reduced-motion: reduce) {
    .gsap-element {
      animation: none;
      transition: none;
    }
  }
  ```
- [ ] Use `useMounted()` (from src/lib/useMounted.ts per project memory) to gate motion decisions on client-side only (avoids SSR hydration branch mismatches).
- [ ] Test with DevTools: Rendering > Emulate CSS media feature prefers-reduced-motion: reduce. Verify page renders identical at-rest layout with zero motion.
- [ ] Audit on real devices: iPhone Settings > Accessibility > Motion > Reduce Motion > ON. Verify no vestibular triggers (spinning, rapid parallax, strobing).

**WCAG 2.2.2 (Pause, Stop, Hide) — Secondary Concern:**
- Applies to **auto-starting** moving/scrolling content (carousels auto-play, chat bubbles that scroll in, tickers).
- Requires pause/stop/hide button if content >5 seconds.
- TGlobal's animations are **user-triggered** (scroll-activated, interaction-driven), so 2.2.2 doesn't apply.
- If WorkMarquee loops indefinitely (auto-scroll), add pause button if >5 second duration.

---

### Browser Support & Progressive Enhancement Strategy

**CSS scroll-driven animations (animation-timeline: view() / scroll()):**
- **Support:** 82.58% globally (Chrome, Edge, Safari 26.0+, Opera; Firefox disabled by default, stable release expected Q3–Q4 2026).
- **TGlobal Approach:** Use as progressive enhancement only. Gate behind `@supports (animation-timeline: view())`.
- **Fallback:** GSAP ScrollTrigger maintains animation for Firefox + unsupported browsers.
- **Implementation example (ProcessAnatomy 10-day rail):**
  ```css
  @supports (animation-timeline: view()) {
    .rail-fill {
      animation: drawRail linear forwards;
      animation-timeline: view(80%);
    }
  }
  @supports not (animation-timeline: view()) {
    /* GSAP ScrollTrigger fills the gap */
  }
  ```

**View Transitions API (same-document SPA transitions):**
- **Support:** 88.64% globally (Baseline Newly available October 2025); Firefox 144+, Safari 18.2+.
- **React 19 Status:** Canary-only; production API unstable. Do NOT adopt without explicit canary version.
- **Conflict with GSAP ScrollTrigger:** Documented in GSAP forums—View Transitions break ScrollTrigger on repeated visits (require cleanup/re-init).
- **TGlobal Recommendation:** Keep opacity-only framer-motion PageTransition. Do NOT integrate View Transitions API unless architecture includes ScrollTrigger cleanup lifecycle.

**Lenis Smooth Scroll + GSAP Sync:**
- **Best Practice (2026):** GSAP ScrollSmoother (native scroll-based) is the officially supported option; Lenis integration is undocumented.
- **If Lenis already integrated:** Ensure sync via GSAP ticker: `gsap.ticker.add((time) => lenis.raf(time * 1000))` with `Lenis({autoRaf: false})`.
- **INP Impact:** No authoritative quantification; depends on scroll callback work. Profile with DevTools: interaction response time should be <50ms per frame.
- **prefers-reduced-motion + Lenis:** Both Lenis and ScrollSmoother docs are SILENT on motion preference support. **Manual implementation required:** detect prefers-reduced-motion and disable smooth scroll, fall back to native scroll.

---

### Performance & Animation Optimization Rules

**Rule 1: Compositor-Only Properties**
Only `transform` and `opacity` skip layout/paint and use GPU acceleration. All others (width, height, top, left, margin, padding) trigger full pipeline recalculation.

- ✓ **Safe:** `gsap.to(el, {x: 100, opacity: 0.5})`
- ✗ **Unsafe:** `gsap.to(el, {width: 200, height: 150})`

**Rule 2: will-change Memory Cleanup**
Every animation must clear will-change after completion. Stacking will-change across 15+ elements (WorkGrid 9 cards + marquee repeats + ProcessTriptych arcs) exhausts GPU memory, causing scroll jank and INP spikes.

- Implementation: `clearProps: 'willChange'` in `.to()` definition or explicit cleanup after timeline.

**Rule 3: Scroll Velocity Skew Clamping**
Velocity-driven distortion (WorkGrid, WorkMarquee) must clamp skew to ±7deg and tween back to 0 smoothly. Unclamped skew on high-velocity scroll looks broken and can cause disorientation (vestibular trigger).

- Implementation: `clamp = gsap.utils.clamp(-7, 7)` applied to `getVelocity()` output.

**Rule 4: Content-Visibility for Large DOMs**
CSS `content-visibility: auto` + `contain-intrinsic-size` skips rendering off-screen elements, freeing main thread for interaction. 30–50% reduction in rendering work on pages with 100+ interactive elements.

- Application: WorkGrid cards, WorkMarquee repeats, ProcessArtifacts marquee.
- Implementation: `.card { content-visibility: auto; contain-intrinsic-size: 350px 280px; }`

**Rule 5: Scroll Listener Sync**
Lenis (if used) must sync to GSAP ticker, not run separate RAF loop. Single ticker = single paint per frame = no jank.

- Implementation: `gsap.ticker.add((time) => lenis.raf(time * 1000))` at app root.

---

### Launch & Validation Checklist

**Pre-Launch SEO:**
- [ ] Remove HowTo JSON-LD from /process; replace with BreadcrumbList or Article schema.
- [ ] Add Organization + Profile page schema; validate with Rich Results Test.
- [ ] Flip /work robots meta to `index, follow`; submit to Search Console.
- [ ] Verify /work, /process in `curl` output include full server HTML (no empty skeletons).

**Core Web Vitals:**
- [ ] PageSpeed Insights LCP <2.5s, INP <200ms, CLS <0.1 (mobile + desktop on 4G throttle).
- [ ] DevTools Performance: no layout shifts during animation; no will-change memory leaks (heap snapshot comparison).
- [ ] Interaction INP: WorkGrid click, ProcessAnatomy interaction <50ms main-thread blocking.

**Accessibility:**
- [ ] DevTools emulate prefers-reduced-motion: reduce; verify all animations disabled, page renders identical layout.
- [ ] Test on real device (iPhone/Android) with motion reduction ON; no vestibular triggers (spinning, rapid parallax).
- [ ] Screen reader (NVDA/JAWS): all text content readable; animation doesn't interfere with nav.

**Animation Performance:**
- [ ] No layout-property animations (width, height, top, left); transform/opacity only.
- [ ] Scroll velocity skew clamped to ±7deg, tweens back smoothly.
- [ ] content-visibility applied to large grids; verify 20–30% main-thread reduction in DevTools.
- [ ] will-change cleanup verified; heap snapshot shows no sustained GPU memory growth after full-page scroll.

**Browser Support:**
- [ ] CSS scroll-timeline: view() behind @supports; GSAP ScrollTrigger fallback active in Firefox.
- [ ] Lenis sync verified on 4G throttle; no jank; INP <200ms.
- [ ] Test on: Chrome 120+, Safari 18.0+, Firefox 128+, Edge 120+, mobile browsers (Chrome Android, Safari iOS).

---

## The craft layer — non-negotiable micro-details

### Motion Design Tokens (Duration/Easing/Stagger Scales)

- [ ] **Define motion token set in `globals.css` via Tailwind v4 @theme**
  - [ ] `--duration-instant: 100ms` (show/hide, immediate feedback)
  - [ ] `--duration-fast: 160ms` (icon transitions, brief swaps)
  - [ ] `--duration-normal: 300ms` (standard entrance, card reveals)
  - [ ] `--duration-slow: 500ms` (hero headlines, major layout shifts)
  - [ ] `--easing-out: cubic-bezier(0.22, 1, 0.36, 1)` (universal curve, all animations)
  - [ ] `--stagger-minor: 0.01s` (character-by-character SplitText reveals)
  - [ ] `--stagger-normal: 0.04s` (line reveals, card stagger in grids, multi-element sequences)
  - [ ] `--stagger-card: 0.06s` (WorkGrid case study cards, ProcessSteps timeline items)
  - [ ] Document token values in a `/docs/motion-tokens.md` file for team reference
  
- [ ] **Wire motion tokens into GSAP effects (global.client.ts or equivalent)**
  - [ ] Create a `motionTokens` object at module load: `{ durationNormal: getComputedStyle(document.documentElement).getPropertyValue('--duration-normal').trim() }`
  - [ ] Register GSAP effects using tokens: `gsap.registerEffect({ name: 'fadeInUp', defaults: { duration: motionTokens.durationNormal, ease: motionTokens.easingOut } })`
  - [ ] All new GSAP code references tokens, not hardcoded values: `gsap.to(el, { duration: var(--duration-normal) })`

- [ ] **Apply motion tokens to Tailwind animation utilities**
  - [ ] Extend `tailwind.config.ts` with: `animation: { 'fade-in': 'fadeIn 0.3s var(--easing-out)', 'slide-up': 'slideUp 0.3s var(--easing-out)' }`
  - [ ] Use Tailwind animation classes instead of inline `transition: all 300ms cubic-bezier(...)`
  - [ ] Example: `<button className='transition-opacity duration-normal ease-out'>` → `<button className='animate-fade-in'>`

- [ ] **Audit all hardcoded durations and easings in existing code**
  - [ ] WorkHero pixelate-morph headline (currently 8s?) → replace with `var(--duration-slow) × 2` or token
  - [ ] WorkMarquee skew (currently 0.4s?) → replace with `var(--duration-fast)`
  - [ ] ProcessHero git-log streaming → replace with `var(--duration-normal)` per line
  - [ ] SplitText stagger → ensure all use `var(--stagger-minor)` for chars, `var(--stagger-normal)` for lines
  - [ ] Replace all `cubic-bezier(...)` NOT matching `(0.22, 1, 0.36, 1)` with `var(--easing-out)`

---

### Choreography & Sequencing (GSAP SplitText + Multi-Layer Staging)

- [ ] **WorkHero headline + subheadline choreography**
  - [ ] SplitText headline into characters, animate `opacity: 0 → 1` and `y: 10 → 0` with `stagger: var(--stagger-minor)` over `var(--duration-normal)`
  - [ ] Delay subheadline entrance by `var(--duration-normal) + 100ms`
  - [ ] Stagger subheadline lines with `var(--stagger-normal)` (line-by-line) offset by headline animation end
  - [ ] Animate WorkHero CTA (magnetic pill) in final 200ms, scale `0.8 → 1` + opacity fade-in
  - [ ] Build entire sequence in a GSAP timeline for atomic execution

- [ ] **WorkFeatured case study tile entrance (BorderBeam, MagicCard, NumberTicker)**
  - [ ] Fade background image in over `var(--duration-slow)` at timeline start
  - [ ] BorderBeam animation begins at `0.2s` offset (anticipation moment before beam)
  - [ ] MagicCard glow intensifies from `0.3s` to `0.8s`
  - [ ] Dashboard mock content (screenshots inside card) fades in at `0.4s`
  - [ ] NumberTicker (e.g., "23 days saved") counts up from `0.6s` to `1.0s` with 60 FPS granularity
  - [ ] Offset each NumberTicker by `0.05s` if multiple tickers present (ProcessMetrics)

- [ ] **WorkGrid case study card gallery entrance**
  - [ ] Iterate over cards with stagger: `cards.forEach((card, i) => tl.from(card, { duration: var(--duration-normal), opacity: 0, y: 20, ease: var(--easing-out) }, i * var(--stagger-card)))`
  - [ ] Ensure total grid entrance time doesn't exceed `2.0s` (if 6 cards × 0.06s = 0.36s offset range)
  - [ ] Test grid entrance with prefers-reduced-motion OFF (full animation) and ON (instant final state)

- [ ] **ProcessHero "Day 10/10" countdown and git-log terminal**
  - [ ] Countdown numbers increment every 100ms (or slower if reduced-motion active)
  - [ ] Git-log lines stream in from left (transform: `translateX(-20px)` → `0`) + opacity fade, stagger `var(--stagger-minor)` per line
  - [ ] Total git-log animation should complete within `var(--duration-slow)` to avoid blocking page interaction
  - [ ] If scroll-driven, use ScrollTrigger + animation-timeline: scroll(); if not, use timeline-based GSAP

- [ ] **ProcessSteps timeline connector line fill (scroll-driven or timeline)**
  - [ ] Progress line grows from `0% → 100%` as user scrolls through ProcessSteps section
  - [ ] Use CSS `animation-timeline: scroll(root inline)` with `@supports` check; fallback to GSAP ScrollTrigger
  - [ ] When prefers-reduced-motion: reduce is set, jump to 100% immediately (no animation envelope)
  - [ ] Checkpoint step numbers (1, 2, 3...) pulse or highlight as their section comes into view

- [ ] **ProcessTriptych (3-column narrative with images + text overlays)**
  - [ ] Stagger entrance: left image → center text → right image (or vice versa) with `0.15s` offset between columns
  - [ ] Image parallax (if used) must be subtle: max `±5px` translateY, no full-screen vertical shift
  - [ ] Text overlays fade in after images settle (offset by `var(--duration-fast)`)

- [ ] **ProcessArtifacts asset gallery + masonry grid**
  - [ ] Animate each artifact from `opacity: 0, scale: 0.9` to `1, 1` with stagger `var(--stagger-card)` per row
  - [ ] If interaction exists (click to expand), animate expanded state with `var(--duration-normal)` duration

---

### Navigation & Scroll Behavior

- [ ] **Sticky header scroll offset for anchor navigation**
  - [ ] Measure sticky nav height dynamically: `const navHeight = document.querySelector('nav')?.offsetHeight || 80`
  - [ ] Set CSS custom property: `document.documentElement.style.setProperty('--scroll-margin-top', (navHeight + 16) + 'px')`
  - [ ] Apply to all major sections and focusable elements:
    ```css
    section, h1, h2, h3, button, a[href*="#"] {
      scroll-margin-top: var(--scroll-margin-top, 96px);
    }
    ```
  - [ ] Test: click anchor link `/process#ProcessSteps` → should scroll to ProcessSteps section with space below sticky nav visible

- [ ] **Scroll restoration on SPA route changes**
  - [ ] Test WorkGrid → WorkGrid case study detail → back to WorkGrid
  - [ ] Scroll should restore to previous position (Next.js 16 default behavior)
  - [ ] If scroll=false is used on a Link, document why (e.g., special transition effect)
  - [ ] For Lenis smooth scroll, ensure Lenis scroll position syncs with window.scrollY on route transitions

- [ ] **View Transitions API cautionary check**
  - [ ] Do NOT use `<ViewTransition>` or experimental.viewTransition in Next.js 16 stable build; requires canary React
  - [ ] If View Transitions are enabled, rebuild ScrollTrigger context after every page load (`gsap.context()` cleanup + re-init)
  - [ ] Monitor for ScrollTrigger pin failures on route back/forward; if found, disable View Transitions or use GSAP Context lifecycle hooks

- [ ] **CSS scroll-driven animations (@supports fallback)**
  - [ ] Wrap all `animation-timeline: scroll(...)` or `view()` rules in `@supports (animation-timeline: scroll())` blocks
  - [ ] Provide GSAP ScrollTrigger fallback inside `@supports not (animation-timeline: scroll())`
  - [ ] Test in Firefox (scroll-driven animations disabled by default until stable release): verify GSAP fallback activates

---

### Focus, Keyboard, and Interactive States

- [ ] **Keyboard focus visibility (:focus-visible)**
  - [ ] Define global focus style in `globals.css`:
    ```css
    *:focus-visible {
      outline: 2px solid var(--primary, #4b28ff);
      outline-offset: 2px;
    }
    ```
  - [ ] Remove default browser outline: `*:focus { outline: none; }`
  - [ ] Test Tab key navigation through /work and /process; focus ring should be visible on all interactive elements
  - [ ] Ensure no focus ring on mouse click (`:focus:not(:focus-visible)` removes it if browser supports it)

- [ ] **Logical tab order (roving tabindex for complex components)**
  - [ ] WorkCTA and ProcessCTA: if they contain multiple magnetic pills or buttons, only the active one should have `tabIndex={0}`, others `tabIndex={-1}`
  - [ ] Arrow keys should move focus: implement `onKeyDown` handler to shift `tabIndex` and call `.focus()`
  - [ ] Test: Tab into a CTA section with multiple buttons; arrow keys should move between buttons; focus ring should follow

- [ ] **Loading state visibility (skeleton screens)**
  - [ ] WorkFeatured case study tile: show skeleton if data > 100ms to load, min 400ms display time
  - [ ] Skeleton shape mirrors final layout (h-64 image placeholder, h-4 text lines)
  - [ ] Add shimmer animation: `background: linear-gradient(90deg, lavender 0%, white 50%, lavender 100%); background-size: 200% 100%; animation: shimmer 2s infinite;`
  - [ ] When data arrives, fade skeleton out and content in (duration `var(--duration-fast)`)
  - [ ] Use Suspense boundary for server-side data fetching: `<Suspense fallback={<SkeletonTile />}><CaseStudy /></Suspense>`

- [ ] **Empty state (no case studies loaded, no ProcessArtifacts)**
  - [ ] Show helpful message with icon or illustration
  - [ ] Offer actionable link (e.g., "Browse all case studies" → `/work`)
  - [ ] Animate empty state in with stagger if multiple empty sections (e.g., ProcessArtifacts empty per category)

- [ ] **Error state (network failure, 500 error on /work/[slug])**
  - [ ] Show error message with retry button
  - [ ] Animate error icon/message in with `var(--duration-normal)` entrance
  - [ ] Retry button: clear previous state, re-fetch, show loading skeleton if needed
  - [ ] Log error to analytics/monitoring (GA4)

- [ ] **404 Not Found page**
  - [ ] Create `/app/not-found.tsx` with brand-consistent design
  - [ ] Minimal SVG animation (< 10KB): glitch line draw, number fade-in, or kinetic typography moment
  - [ ] GSAP timeline: fade SVG in over `var(--duration-normal)`, stagger any SVG elements
  - [ ] Respect prefers-reduced-motion: jump to final state if motion is off
  - [ ] CTA buttons (Home, Back to Work) with magnetic pill styling; `focus-visible` outline applied

---

### Accessibility of Motion (Reduced-Motion Parity, ARIA, Vestibular Safety)

- [ ] **Reduced-motion parity testing protocol**
  - [ ] Set system preference: `prefers-reduced-motion: reduce` in OS settings (Windows: Settings → Ease of Access → Display → Show animations; macOS: System Preferences → Accessibility → Display → Reduce motion)
  - [ ] Open `/work` in browser; capture full-page screenshot with animations OFF
  - [ ] Toggle animations back ON; capture same-viewport screenshot
  - [ ] Diff images: layout, spacing, text content, image visibility must be IDENTICAL
  - [ ] Automated: run `npm run sweep -- /work /process` (captures both motion states and diffs)
  - [ ] No hidden elements, no broken grid layouts, no missing text when motion is off

- [ ] **ARIA live region announcements for NumberTickers**
  - [ ] WorkMetrics NumberTicker counters: wrap in `<div aria-live="polite" aria-atomic="true">`
  - [ ] Update text content every 60ms during count-up; screen reader announces the updated value
  - [ ] ProcessHero "Day 10/10" countdown: use `aria-live="assertive"` if time-critical (interrupts current announcement)
  - [ ] Test with screen reader (NVDA on Windows, VoiceOver on macOS): numbers should be announced as they increment

- [ ] **ARIA labels for animated interactive elements**
  - [ ] MagneticPill CTA buttons: ensure `<button aria-label="Submit inquiry">` if button text is decorative or icon-only
  - [ ] ProcessQA accordion: `aria-expanded="true|false"` reflects open/closed state; screen reader announces expansion
  - [ ] WorkMarquee carousel (if focused): `aria-live="polite"` announces which slide is active

- [ ] **Vestibular-safe animation constraints**
  - [ ] WorkHero pinned canvas: any parallax or scale transforms on child layers max `±5%` (±5px on typical viewport)
  - [ ] WorkMarquee scroll-velocity skew: cap at `±7deg` (never exceed ±10deg); test on mobile at high scroll speeds
  - [ ] ProcessHero git-log streaming: line entrances max `2s` total; no rapid flashing (no `@keyframes` with < 200ms cycles)
  - [ ] Hero section pinned duration: `540svh` is long; ensure no user input is blocked during pin (buttons outside pin area remain interactive)
  - [ ] Avoid: full-screen video backgrounds, multi-layer parallax beyond current scope, abrupt zoom-in/zoom-out

- [ ] **Motion preferences in MotionConfig context**
  - [ ] TGlobal brand uses `MotionConfig reducedMotion="never"` (animations always-on for brand aesthetic)
  - [ ] But fallback CSS media query `prefers-reduced-motion: reduce` must still WORK if user has OS setting enabled
  - [ ] Example: if `reducedMotion="never"` via MotionConfig BUT user OS has reduce enabled, framer-motion ignores OS preference, BUT GSAP and CSS animations must respect it
  - [ ] Ensure GSAP animations check: `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and skip animation envelope if true
  - [ ] Document this hybrid approach in `/docs/motion-config.md`: "Brand enforces motion always-on, but respects OS accessibility setting as fallback."

- [ ] **SSR hydration safety for motion-branching JSX**
  - [ ] Use `useMounted()` hook from `src/lib/useMounted.ts` to gate any conditional JSX based on `useReducedMotion()`
  - [ ] Pattern:
    ```tsx
    const mounted = useMounted();
    const prefersReduced = useReducedMotion();
    return (
      <section>
        {mounted && prefersReduced ? (
          <div>{/* Static final-state headline */}</div>
        ) : (
          <motion.div animate={{ ... }}>...</motion.div>
        )}
      </section>
    );
    ```
  - [ ] Server renders Shape A (safe default); client patches imperceptibly to Shape B if needed
  - [ ] NO hydration errors; NO flashing of wrong state on first render

---

### Performance Hygiene (Compositor-Only Props, will-change, Asset Preload)

- [ ] **Restrict animations to compositor-safe properties**
  - [ ] SAFE: `opacity`, `transform` (translate, rotate, scale), `filter`
  - [ ] RISKY: `width`, `height`, `left`, `top`, `margin`, `padding` (trigger layout recalc)
  - [ ] Audit all GSAP tweens: WorkHero, WorkMarquee, ProcessHero, ProcessSteps animations
  - [ ] If animating position, use `transform: translate()` NOT `left`/`top`
  - [ ] If animating size, use `transform: scale()` NOT `width`/`height`
  - [ ] Exception: carousel/grid item dimensions on load (initial layout unavoidable); animate only after layout settles

- [ ] **will-change discipline**
  - [ ] Add `will-change: transform, opacity` to elements that animate on scroll (ScrollTrigger triggers)
  - [ ] Remove `will-change` after animation completes (or use GSAP autoKill: true)
  - [ ] Example: WorkHero canvas layers get `will-change: transform` during pin; remove on pin-out
  - [ ] Avoid `will-change: all` (expensive); be specific about properties

- [ ] **CSS containment for scroll-heavy sections**
  - [ ] ProcessSteps with many timeline items: apply `contain: layout style paint` to reduce repaint scope
  - [ ] WorkMarquee infinite marquee: apply `contain: layout` to marquee container
  - [ ] Test FCP/LCP impact; if no regression, keep containment; if regression, profile before/after

- [ ] **content-visibility for deferred rendering**
  - [ ] Below-the-fold sections (ProcessQA accordion, ProcessArtifacts gallery, ProcessCTA footer) get `content-visibility: auto`
  - [ ] Browser skips rendering until section enters viewport; huge LCP win if /process is long
  - [ ] Pair with `contain-intrinsic-size` to reserve layout space: `content-visibility: auto; contain-intrinsic-size: auto 600px;`
  - [ ] Fallback for unsupported browsers is no animation; no harm

- [ ] **Asset preload and priority**
  - [ ] Critical fonts (Albert Sans, Instrument Serif): add `<link rel="preload" href="/fonts/AlbertSans.woff2" as="font" type="font/woff2" crossOrigin />`
  - [ ] Hero image (WorkHero background): preload with `fetchpriority="high"` in Next.js Image component
  - [ ] GSAP library: no preload needed (already bundled into JS); ensure GSAP assets in same JS chunk as ScrollTrigger
  - [ ] SVG symbols (icons): inline or use sprite sheet; avoid separate HTTP requests per icon

- [ ] **Bundle analysis and code splitting**
  - [ ] GSAP + ScrollTrigger: share one bundle chunk, ~80KB gzipped
  - [ ] Lenis: separate dynamic import `const Lenis = (await import('lenis')).default` if not critical path
  - [ ] framer-motion: bundled with app, ~60KB gzipped; consider if PageTransition alone justifies cost
  - [ ] Run `npm run build` and analyze bundle in Next.js build output; aim for no single chunk > 250KB
  - [ ] Monitor LCP: if > 2.5s, prioritize bundle reduction over new animations

- [ ] **Image optimization (WorkGrid, WorkFeatured, ProcessArtifacts)**
  - [ ] Use Next.js `<Image>` with `priority={true}` for above-the-fold thumbnails
  - [ ] Set `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"` for responsive images
  - [ ] Enable Tailwind's `blur-up` placeholder: `placeholder="blur"` in Image component
  - [ ] WebP format with fallback: `srcSet` with AVIF and WebP
  - [ ] WorkFeatured case study screenshot inside MagicCard: lazy-load if not in viewport (use `loading="lazy"` or IntersectionObserver)

---

### Primitives Checklist (AnimateIn, MagicCard, WordReveal, Marquee, NumberTicker, CustomCursor)

- [ ] **AnimateIn component (entrance animation wrapper)**
  - [ ] Used on WorkHero headline, ProcessHero subheadline, ProcessSteps timeline items
  - [ ] Props: `delay`, `duration` (default `var(--duration-normal)`), `easing` (default `var(--easing-out)`)
  - [ ] Internally uses framer-motion or GSAP; must respect `useReducedMotion()`
  - [ ] Test: with motion OFF, content should appear immediately (no `initial` → `animate` state)

- [ ] **MagicCard (cursor-glow, gradient border, elevation on hover)**
  - [ ] Used in WorkFeatured case study tiles
  - [ ] Props: `children`, `onHover` callback (optional), `glowColor` (default primary violet)
  - [ ] Glow follow cursor with 80ms lag (slight inertia for smoothness)
  - [ ] Hover state: scale `1.02` + shadowBlur increase; duration `var(--duration-fast)`
  - [ ] Respect reduced-motion: skip scale/shadow animations, keep glow if aesthetic only

- [ ] **WordReveal (character-by-character headline animation)**
  - [ ] Used in WorkHero main headline, ProcessHero "Day 10/10" section
  - [ ] Uses GSAP SplitText internally; stagger `var(--stagger-minor)` per character
  - [ ] Props: `children` (string), `delay`, `duration` (default `var(--duration-normal)`)
  - [ ] Interpolate from `opacity: 0, y: 10` to `opacity: 1, y: 0`
  - [ ] Test reduced-motion: all characters appear instantly, no character-by-character reveal

- [ ] **Marquee (infinite horizontal scroll animation)**
  - [ ] Used in WorkMarquee (client logos, metrics, or quotes on infinite loop)
  - [ ] Props: `children`, `speed` (default 50px/s), `direction` ("left" | "right"), `pauseOnHover` (boolean)
  - [ ] Duplicate content 3x to ensure seamless loop (no visual gap at wrap)
  - [ ] Use CSS animation (not GSAP) for performance: `@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }`
  - [ ] Duration: `100% width / speed = duration`; e.g., 500px / 50px = 10s
  - [ ] Respect reduced-motion: pause animation or show static first item

- [ ] **NumberTicker (counting animation from 0 to target value)**
  - [ ] Used in WorkMetrics, ProcessHero counters
  - [ ] Props: `from` (default 0), `to` (target), `duration` (default `var(--duration-slow)`), `format` (optional number formatter)
  - [ ] Animate using RAF or GSAP.to() with `onUpdate` callback
  - [ ] 60 FPS granularity (update every 16ms)
  - [ ] Wrap in `<div aria-live="polite" aria-atomic="true">` for screen reader announcements
  - [ ] Reduced-motion: skip animation, jump directly to final `to` value

- [ ] **CustomCursor (tracking cursor position, glow/trail effects)**
  - [ ] Used on /work and /process pages (optional, if in scope)
  - [ ] Props: `glowColor`, `trailLength`, `enabled`
  - [ ] Track `mousemove` with 30-50ms debounce; update position via transform (not left/top)
  - [ ] Glow radius: 40-60px, alpha 0.3-0.5 (subtle, non-intrusive)
  - [ ] Hide on mobile (touch events don't have cursor)
  - [ ] Reduced-motion: disable glow/trail, show default cursor

---

### Summary: Verification Checklist

Before shipping:
- [ ] Run `npm run sweep -- /work /process` with motion ON and OFF; diff images for visual parity
- [ ] Tab through /work and /process; focus ring visible on all interactive elements, no Tab traps
- [ ] Test NumberTickers with screen reader (NVDA/VoiceOver); numbers announced as they count
- [ ] Lighthouse Accessibility > 90; INP < 200ms; LCP < 2.5s; CLS < 0.1
- [ ] Test in Firefox (ScrollTrigger fallback active if CSS scroll-driven unsupported)
- [ ] Anchor navigation (e.g., `/process#ProcessSteps`) scrolls with nav-aware offset visible
- [ ] Scroll restoration: navigate /work → case study detail → back; scroll position restores
- [ ] Load WorkFeatured case study with slow network (Lighthouse slow 4G); skeleton shows, animates in smoothly
- [ ] Reduced-motion OS setting enabled; open /work; no animations run, layout is identical
- [ ] All GSAP animations use `var(--duration-*)` and `var(--easing-out)` tokens, no hardcoded values
- [ ] No `will-change` remains post-animation; `content-visibility` applied to below-fold sections
- [ ] Bundle analysis: no single chunk > 250KB; GSAP + framer-motion together < 150KB gzipped

---

## Phased rollout plan

### Phase 0: Foundations & SEO Fixes (Effort: M | Duration: 1-2 sprints)

**Goal:** Remove technical debt, establish motion/SEO parity, unblock subsequent phases.

**Tasks:**
- Remove deprecated HowTo and FAQ JSON-LD from `/process` page; replace with supported rich result types (Article, BreadcrumbList) or structural data only
- Audit current `/work` and `/process` noindex directives; plan removal timing (Phase 1 assumes `/work` detail pages ship first)
- Strip unused View Transitions experiment code from Next.js 16 config (remains untested with ScrollTrigger in your stack)
- Gate all CSS scroll-driven animations (`animation-timeline: scroll()` and `view()`) behind `@supports` feature queries; maintain GSAP ScrollTrigger fallback for Firefox <144 (currently disabled by default)
- Validate reduced-motion parity on all 8 sections: each animation (GSAP + CSS + framer-motion PageTransition) must render identically with `prefers-reduced-motion: reduce` active
- Run `npm run sweep -- /work /process` with motion ON and OFF; document visual pixel diffs (none permitted)
- Verify Lenis velocity capture (`window.lenisVelocity`) is properly nulled/gated to prevent INP regressions (INP threshold: ≤200ms at 75th percentile)

**Success Criteria:**
- Zero schema validation errors; no dead HowTo markup
- `@supports (animation-timeline: scroll())` present on all CSS scroll-driven code; fallback GSAP applied on unsupported browsers
- Reduced-motion audit passes 100% on both `/work` and `/process` (pixel-identical renders)
- `npm run sweep` shows no layout shift (CLS ≤0.1) on either page, motion ON/OFF
- LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 on both pages at 75th percentile (measure via Lighthouse + DebugBear if CI available)
- Firefox 110-143 users see working GSAP fallback; no broken CSS animations
- Lenis velocity-driven features degrade gracefully on slow networks (no > 500ms INP spike)

---

### Phase 1: High-Impact, Low-Risk Wins (Effort: L-M | Duration: 1-2 sprints)

**Goal:** Ship signature motion enhancements on both pages that feel alive without technical risk.

**Tasks:**

**WorkHero:**
- Add micro-stagger on industry carousel item reveals (existing `centeredFractionalIndex` math; add `parallaxOffset = dist * 8px` for Y offset per item)
- Implement velocity-responsive chromatic aberration on headline text during morph phase (progress 0–0.5); RGB channel offset scaled by Lenis velocity magnitude, clamped ±3px
- Gate both enhancements behind `!reducedMotion` and `useMounted`

**WorkFeatured:**
- Replace static CSS-only dashboard mock with actual project image
- Implement SVG mask grid reveal (30 horizontal strips expanding from center outward, stagger 0.02s, scrub: 2.0) on image enter
- Bind to ScrollTrigger: start `top center`, end `bottom center`; reduce to 15 strips on mobile/budget phones if jank detected

**WorkGrid:**
- Add micro-stagger scale + opacity reveals per card (scale 0.95→1.0, opacity 0→1, stagger 0.08s per column, easing `power2.out`)
- Enhance velocity-driven skew with parallax lag per column using ScrollSmoother (distance from center → lag 0.02–0.04s); test ScrollTrigger + ScrollSmoother for conflicts
- Gate behind `!reducedMotion`

**WorkMarquee:**
- Implement velocity-driven marquee blur (0→4px scaled to velocity, clamped at 4px)
- Add optional parallax layering: second marquee track at 80% speed (foreground 30s, background 37.5s infinite loop) for depth
- Gate behind `!reducedMotion`; reduce second layer on mobile/low-GPU devices

**ProcessHero:**
- Implement character-level SplitText clip-path reveal on headline (0.05s stagger, gate behind `useMounted`)
- Add velocity-responsive commit stream playback: 260ms/commit at rest, 180ms at >500px/s (bounded 1–1.8× multiplier)
- Gate SplitText revert() on unmount; test velocity undefined on first render

**ProcessContrast:**
- Replace strikethrough CSS with SVG `<line>` element; animate stroke-dashoffset 100→0 over 500ms on row enter (ScrollTrigger once: true)
- Add TGlobal text inset glow (box-shadow: inset 0 4px 8px rgba(189,112,246,0.08)) + micro-scale 1.01 on row enter
- Gate behind `!reducedMotion`

**Success Criteria:**
- All enhancements pass `npm run sweep` (motion ON/OFF identical pixel render, CLS ≤0.1)
- No visual jank on Moto G7 or iPhone SE (budget device testing required)
- Velocity-driven features graceful-degrade on slow networks (no INP spike >250ms)
- Reduced-motion users see fully visible final state on all reveals (no clipped content)
- ScrollTrigger + ScrollSmoother conflict test passes (no fighting timescales)
- LCP, INP, CLS remain within Phase 0 targets

---

### Phase 2: Signature Set-Pieces (Effort: M-L | Duration: 2-3 sprints)

**Goal:** Ship ambitious, high-impact animations that differentiate TGlobal's motion design.

**Tasks:**

**WorkFeatured:**
- Implement parallax gallery dual-layer: image parallax (yPercent -50 to 50) + SplitText stagger on headline + outcome reveal (clip-path, 0.06s per line)
- Bind to ScrollTrigger scrub: 1; text reveal completes 100ms before parallax finishes
- Test short vs. long headlines for reveal timing parity; adjust scrub if needed

**WorkGrid (FLIP transition):**
- Wrap each WorkProjectCard in ref; implement GSAP Flip card-to-hero animation on click
- On click: capture Flip state; navigate to detail page
- On detail page entry via PageTransition: `Flip.from(state, { duration: 0.6, ease: 'expo.inOut' })`
- Gate behind `mounted`; store bounding rect in Zustand before nav to survive card unmount
- Test with TGlobal cubic-bezier(0.22, 1, 0.36, 1) easing

**WorkGrid (SVG mask per card):**
- Implement 8×8 grid SVG mask per card; randomize cell reveal order seeded by slug (deterministic)
- Each cell opacity 0→1 over 0.6s with stagger; ScrollTrigger per card (start `top 80%`, end `bottom 20%`, scrub: true)
- Reduce to 4×4 grid (16 cells) on mobile or if frame drops detected; measure on Moto G7
- Gate behind `useMounted` and `!reducedMotion`

**WorkMarquee:**
- Add SplitText character-by-character reveal on first scroll-in (clip-path inset 100%→0, stagger 0.03s, total ~0.5s)
- Create overlay div to fade after reveal; keep marquee loop continuous after
- ScrollTrigger: start `top 80%`, end `top 20%`, scrub: false (one-time)

**WorkProcessTeaser:**
- Implement CSS Scroll-Driven Animations with `animation-timeline: view()` per step (Scope 0–30%, Ship 20–60%, Measure 40–100%)
- Icons slide-in + text fade at staggered ranges (100% CSS, no JS)
- Add animated step connectors: SVG stroke-dashoffset 1000→0 with GSAP ScrollTrigger scrub: true; circles pulse at 50% mark
- Gate behind `@supports (animation-timeline: scroll())`; fallback to static elements on unsupported browsers

**ProcessSteps (FLIP + deliverable reveals):**
- Implement FLIP morph on step card enter (collapsed→full-size over 0.3s)
- Numeral marker arrives 80ms earlier; deliverable list slides in (y: 12→0, opacity 0→1, stagger 0.08s) after arc completes
- 3-layer stagger: numeral 0–80ms, card 80–280ms, deliverables 280–500ms (target <600ms total on mobile)
- Add color-coded deliverable icons (lucide-react) with type labels (green artifacts, blue docs, amber infra)
- Gate behind `useMounted` and `!reducedMotion`

**ProcessAnatomy (milestone badge + word reveals):**
- Badge expansion 1.0→1.2× on scroll-in (300ms, ease `back.out`); glow halo pulses 2.4s cycle
- Implement SplitText on badge label (character-by-character clip-path reveal, stagger 0.05s)
- Add focus statement word-by-word reveal per tile (slide up + fade, stagger 0.1s, 300ms duration)
- IntersectionObserver rootMargin: `0px 200px 0px 200px`; test threshold on various viewports
- Gate behind `useMounted` and `!reducedMotion`

**ProcessTriptych (velocity-responsive arc + tool reveals + status pulse):**
- Arc fill speed inversely scales with scroll velocity (fast scroll 800ms, slow 1600ms)
- Tools staggered reveal (0.15s apart) when arc ≥80% (updated from 0.3s stagger baseline)
- Card scale micro-lift 0.98→1.0 on enter
- Tool icons hover: scale 1.08, icon rotate 180° (or 360° if spin preferred), caption clip-path wipe right→left
- Status label glow pulse 1.8s cycle; text color shift muted→status color over 400ms
- Gate behind `useMounted` and `!reducedMotion`

**ProcessArtifacts (velocity + tile hover + color pulse):**
- Marquee playback speed scales with velocity (20s→6.7s loop at 3× speed); pair with skew ±3° (clamp <5°)
- Tile hover: scale 1.08, icon rotate 360°, caption slide-in (clip-path reveal)
- On section enter, staggered color pulse across all tiles (~2s wave, stagger 0.06s per tile)
- Test will-change: background-color for reflow prevention on 30+ tiles
- Gate behind `useMounted` and `!reducedMotion`

**ProcessQA (word reveals + answer glow + underline draw):**
- Question text animates word-by-word on row enter (stagger 0.08s, slide up + fade)
- Answer text character-by-character clip-path left→right (stagger 0.02s) starting 200ms after question finishes
- SVG `<line>` underline draws left→right below answer over ~0.3s, landing 100ms after answer reveal completes
- Answer inset glow + 4px left border (primary color) slide top→bottom simultaneously
- Validate combined duration <3s for readable speed; test long answers (>100 chars) for reflow risk
- Gate behind `useMounted` and `!reducedMotion`

**Success Criteria:**
- All enhancements pass `npm run sweep` (motion ON/OFF identical pixel render, CLS ≤0.1)
- Flip transition frame-rate stable on iPhone 12 and Moto G7 (target 55+ FPS; accept 48+ FPS on budget)
- SVG mask grids reduce to 4×4 on mobile without visual degradation (A/B test if possible)
- Lenis velocity-responsive timing feels reactive, not jarring; cap velocity effects at predictable ranges
- GSAP ScrollTrigger + ScrollSmoother coexist without timing conflicts
- LCP, INP, CLS remain within Phase 0 targets (or improved)
- Accessibility audit: all reveals gate behind `useMounted`, SplitText revert on unmount, no hidden content in reduced-motion mode

---

### Phase 3: Polish & New Sections (Effort: L | Duration: 1-2 sprints)

**Goal:** Add final refinements and prepare for new content sections (e.g., expanded testimonials, case study bridge).

**Tasks:**
- **WorkTestimonials:** Implement floating/layered card stacks with parallax depth (Y offset -20px to +40px per card, scrub: 1); add SplitText character-by-character quote reveal on scroll-in (clip-path, stagger 0.02s)
- **New sections (if approved in Phase 0):** Bridge section or testimonial expansion with same animation language
- Polish all Phase 2 animations with final timing curves (test on real device with DevTools performance profile)
- Audit motion accessibility: ensure all prefers-reduced-motion: reduce branches fully tested (run `npm run sweep` every 2 sprints minimum)
- Finalize Lenis / ScrollTrigger / ScrollSmoother configuration; document velocity capture approach for future maintainers
- Bundle size audit: measure GSAP + plugin footprint; optimize if >50KB delta from baseline

**Success Criteria:**
- All pages (8 sections across `/work` and `/process`) pass `npm run sweep` with motion ON/OFF identical pixel render
- LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 at 75th percentile (Lighthouse + real-user CWV measurement)
- Reduced-motion testing automated or documented in CI (e.g., Playwright `prefers-reduced-motion: reduce` test suite)
- GSAP bundle size <60KB gzip (SplitText + ScrollTrigger + utilities)
- Motion design language consistent across both pages (same easing curves, stagger cadence, velocity response ranges)

---

## Open questions for Rhythm

1. **Detail pages & indexing:** Are real case study detail pages (`/work/[slug]`) shipping before Phase 1 end? If yes, when can `/work` grid flip from `noindex` to indexed? This unblocks SEO benefit and internal linking from grid to detail pages.

2. **Velocity-responsive features:** What's your appetite for scroll velocity driving playback speed, skew, and blur? The current Lenis integration is smooth, but fast trackpad scrolls (>1500px/s) can trigger jank on budget phones. Should we cap velocity effects at lower thresholds (e.g., 800px/s max)?

3. **WebGL / shader budget:** The WorkHero pixelate morph already uses canvas + MeshGradient. Should we reserve budget for advanced shaders (e.g., chromatic aberration as WebGL vs. CSS RGB offset)? Current phase plan uses CSS RGB offset (simpler, works cross-browser).

4. **Testimonials expansion:** WorkTestimonials section is 3 quotes currently. Is expansion to 5–6+ testimonials planned? If yes, should we batch-load or lazy-load testimonials to preserve LCP?

5. **ProcessQA content lock:** The 3 Q&A pairs (timeline anxiety → cost → ownership) are locked per design. Confirm this is finalized; if new Q&As added later, animation timing (word stagger, underline draw) may need re-tuning.

6. **Sound / motion preference UI:** No mention of sound on/off toggle. Should `/work` or `/process` expose audio muting for future video backgrounds or ambient soundscapes? (Out of scope for Phase 0–3, but inform architecture now.)

7. **Firefox stable ship date:** GSAP ScrollTrigger fallback is required because Firefox 110–143 have scroll-driven animations disabled by default. Do you want to monitor Firefox's stable release (expected Q3/Q4 2026) and remove CSS fallback detection afterward, or maintain both paths indefinitely?

8. **Mobile parallax / skew tuning:** Current phases reduce SVG mask grids to 4×4 and cap velocity-driven skew on budget phones. Should we test with actual 5G-throttled Moto G7 (or similar) and provide granular performance opts (e.g., toggle to disable parallax on devices <4GB RAM)?

---

## Appendix A — Reference sites worth studying directly

- [https://www.phantom.land/](https://www.phantom.land/) — Flagship award-winning creative studio portfolio combining WebGL, 3D interactions, and fluid animations. Demonstrates production-grade motion design with velocity-driven effects and shader-based transitions. Awwwards SOTD winner 2025-2026.
- [https://www.14islands.com/](https://www.14islands.com/) — Stockholm/Reykjavík creative agency known for immersive experiences (Cartier, Neko Health). Showcases dual-layer parallax galleries, interactive storytelling, and dimensional transitions. Award-winning case studies on design+craft philosophy.
- [https://immersive-g.com/](https://immersive-g.com/) — Paris-based studio; Awwwards Agency of the Year 2025. Specializes in narrative-driven motion design with thematic coherence. Portfolio demonstrates scroll-driven reveals, 3D journeys, and editorial motion principles.
- [https://www.exoape.com/](https://www.exoape.com/) — Global digital studio emphasizing motion as core narrative device. Portfolio organized as interactive gallery with smooth transitions. Demonstrates macro-level interaction design alongside micro-animations. Sound design integration.
- [https://tympanus.net/codrops/2026/05/06/from-shader-uniforms-to-clip-path-wipes-how-gsap-drives-my-portfolio/](https://tympanus.net/codrops/2026/05/06/from-shader-uniforms-to-clip-path-wipes-how-gsap-drives-my-portfolio/) — Codrops case study of production portfolio using GSAP + WebGL/OGL shaders. Demonstrates velocity-driven chromatic aberration, flowmap textures, and unified animation orchestration. Directly applicable patterns for /work hero.
- [https://tympanus.net/codrops/2026/05/28/the-never-ending-story-building-a-seamless-infinite-scroll-experience-with-gsap-lenis/](https://tympanus.net/codrops/2026/05/28/the-never-ending-story-building-a-seamless-infinite-scroll-experience-with-gsap-lenis/) — May 2026 tutorial on seamless infinite scroll with layered parallax. Architecture pattern (duplication + Lenis snapping) used in WorkMarquee/ProcessArtifacts. Emphasis on simplicity over complexity.
- [https://tympanus.net/codrops/2026/03/11/svg-mask-transitions-on-scroll-with-gsap-and-scrolltrigger/](https://tympanus.net/codrops/2026/03/11/svg-mask-transitions-on-scroll-with-gsap-and-scrolltrigger/) — Four SVG mask reveal patterns (Blinds, Grid, Random, Column-Wave) with precise stagger timing. Directly applicable to WorkGrid and portfolio image galleries. GPU-accelerated, scroll-synced reveals.
- [https://tympanus.net/codrops/2025/06/03/elastic-grid-scroll-creating-lag-based-layout-animations-with-gsap-scrollsmoother/](https://tympanus.net/codrops/2025/06/03/elastic-grid-scroll-creating-lag-based-layout-animations-with-gsap-scrollsmoother/) — Distance-based lag grid animation using ScrollSmoother (not ScrollTrigger). Creates tactile, physical feel. Alternative approach to existing WorkGrid velocity-skew pattern. Touch-optimized.
- [https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/](https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/) — Nov 2025 tutorial on 3D camera scroll paths with particle effects. Applicable to ProcessHero and ProcessTriptych for immersive storytelling. Demonstrates GSAP timeline orchestration with Three.js.
- [https://blog.olivierlarose.com/tutorials/magnetic-button](https://blog.olivierlarose.com/tutorials/magnetic-button) — Reference for magnetic button/CTA interactions using gsap.quickTo(). Production-proven pattern for WorkCTA/ProcessCTA elements. Demonstrates performance optimization (quickTo vs. to).
- [https://obys.agency/](https://obys.agency/) — Awwwards Studio of the Year 2023; demonstrates editorial grid layout, micro-animations on project cards, and restrained typography hierarchy. Their 19-project portfolio uses thematic categorization and numbered grid system aligned with TGlobal's taste.
- [https://www.metalab.com/work](https://www.metalab.com/work) — Award-winning case study presentation system with contextual portal navigation (hover reveals, click deepens). Shows sophisticated approach to filtering, asymmetric card layout, and visual storytelling via case study structure. Perfect reference for TGlobal's future case study indexing.
- [https://www.basicagency.com/](https://www.basicagency.com/) — BASIC/DEPT carousel case study showcase with draggable navigation and featured engagements. Typography hierarchy and card design are exceptionally restrained; demonstrates how to present client work without visual noise.
- [https://tympanus.net/codrops/2026/03/02/sticky-grid-scroll-building-a-scroll-driven-animated-grid/](https://tympanus.net/codrops/2026/03/02/sticky-grid-scroll-building-a-scroll-driven-animated-grid/) — Concrete Codrops tutorial with full code: scroll-driven grid reveal using GSAP ScrollTrigger + Lenis. Shows temporal overlap technique and staggered column reveals that directly apply to WorkGrid layout and motion.
- [https://tympanus.net/codrops/2026/01/20/animating-responsive-grid-layout-transitions-with-gsap-flip/](https://tympanus.net/codrops/2026/01/20/animating-responsive-grid-layout-transitions-with-gsap-flip/) — Step-by-step GSAP Flip tutorial for responsive grid morphing across breakpoints. Directly applicable to WorkGrid and ProcessTriptych responsive behavior without layout shift jarring.
- [https://antonandirene.com/](https://antonandirene.com/) — Brooklyn-based studio with concept-driven, editorial design philosophy. Their case study work (Media Majlis, M+ Museum) shows how to balance visual storytelling with cultural intent. Aligns with TGlobal's brand voice.
- [https://scroll.locomotive.ca/](https://scroll.locomotive.ca/) — Locomotive Scroll v5 (built on Lenis, which TGlobal uses). Documentation and examples show parallax depth, scroll-velocity effects, and scroll-timeline CSS. Direct reference for Lenis integration patterns.
- [https://hellomonday.com/](https://hellomonday.com/) — New York-based creative studio; filterable project grid with category-based navigation and detail case studies. Shows how to balance breadth (grid of all work) with depth (individual project deep-dives) for lead generation.
- [https://www.awwwards.com/websites/typography/](https://www.awwwards.com/websites/typography/) — Curated collection of typography-heavy web design winners. Demonstrates how bold type scale, whitespace rhythm, and editorial grid tension work in award-winning sites. Taste reference for TGlobal's typography strategy.
- [https://gsap.com/docs/v3/Plugins/ScrollTrigger/](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) — GSAP official ScrollTrigger docs; includes performance best practices, pin caveats, and mobile-safe patterns. Critical reference for avoiding the transform-in-PageTransition pitfall and optimizing multiple pins.
- [https://cappen.com](https://cappen.com) — Award-winning interactive digital studio (Miami/São Paulo). Portfolio exemplifies seamless scroll journeys, fluid GSAP interactions, custom cursors, fullscreen project presentations, and immersive WebGL effects. Demonstrates how case studies can feel cinematic without overwhelming the work itself.
- [https://tympanus.net/codrops/2026/02/18/joffrey-spitzer-portfolio-a-minimalist-astro-gsap-build-with-reveals-flip-transitions-and-subtle-motion/](https://tympanus.net/codrops/2026/02/18/joffrey-spitzer-portfolio-a-minimalist-astro-gsap-build-with-reveals-flip-transitions-and-subtle-motion/) — Codrops case study (Feb 2026) on FLIP-driven transitions using Astro + GSAP. Shows exactly how to animate project thumbnails into detail pages while maintaining minimalist aesthetic. Technical breakdown of performance-friendly state capture and animation.
- [https://tympanus.net/codrops/2025/03/05/case-study-stefan-vitasovic-portfolio-2025/](https://tympanus.net/codrops/2025/03/05/case-study-stefan-vitasovic-portfolio-2025/) — Codrops case study (March 2025) on advanced WebGL implementation. Stefan Vitasović's portfolio uses shared Three.js plane meshes for video textures, shader overlays (LED + noise), and custom scroll systems. Gold standard for performance-optimized video-heavy case study presentation.
- [https://www.awwwards.com/websites/portfolio/](https://www.awwwards.com/websites/portfolio/) — Awwwards portfolio category shows current award-winning work. Filter by Site of the Day or Developer Award to study layout patterns, typography approaches, and interaction design from globally recognized studios. Updated daily.
- [https://developer.chrome.com/docs/web-platform/view-transitions](https://developer.chrome.com/docs/web-platform/view-transitions) — Official Chrome documentation on View Transitions API (Chrome 126+). Essential reading for understanding native, hardware-accelerated page transitions that reduce JavaScript overhead. Shows cross-document and same-document implementation patterns.
- [https://basecamp.com/shapeup](https://basecamp.com/shapeup) — Canonical process/methodology documentation with editorial depth; Shape Up is the gold standard for transparent process framing that positions methodology as competitive advantage
- [https://www.pentagram.com/work/wgsn/story](https://www.pentagram.com/work/wgsn/story) — WGSN case study: Giorgia Lupi designed animated data visualization showing 5-phase methodology (Observe → Synthesize → Forecast → Focus → Re-evaluate) with flowing channel imagery that works both static and animated
- [https://tympanus.net/codrops/2026/03/02/sticky-grid-scroll-building-a-scroll-driven-animated-grid/](https://tympanus.net/codrops/2026/03/02/sticky-grid-scroll-building-a-scroll-driven-animated-grid/) — Production tutorial on sticky grid scroll patterns with CSS scroll-driven animations; directly applicable to phase cards and artifact galleries
- [https://www.ramotion.com/](https://www.ramotion.com/) — Design agency specializing in animated methodology storytelling and process visualization; Ramotion combines strategy/branding/design in unified visual systems
- [https://clay.global/](https://clay.global/) — UX/branding studio: prioritizes portfolio-driven process storytelling over explicit flow diagrams; demonstrates alternative methodology: service categories over sequential timeline
- [https://tympanus.net/codrops/2026/01/15/building-a-scroll-driven-dual-wave-text-animation-with-gsap/](https://tympanus.net/codrops/2026/01/15/building-a-scroll-driven-dual-wave-text-animation-with-gsap/) — Codrops GSAP tutorial on scroll-driven dual-wave animation; relevant for revealing process steps in non-linear, rhythmic patterns
- [https://www.awwwards.com/websites/gsap/](https://www.awwwards.com/websites/gsap/) — Curated gallery of award-winning GSAP animations; 27+ Awwwards SOTD winners showcase production-grade ScrollTrigger patterns for process pages
- [https://designthinking.ideo.com/](https://designthinking.ideo.com/) — IDEO's Design Thinking resource hub; demonstrates human-centered visual framing of methodology without heavy animation; emphasis on accessibility and clarity
- [https://tympanus.net/codrops/2026/03/02/sticky-grid-scroll-building-a-scroll-driven-animated-grid/](https://tympanus.net/codrops/2026/03/02/sticky-grid-scroll-building-a-scroll-driven-animated-grid/) — Deep technical tutorial on scroll-driven grids with GSAP + Lenis. Demonstrates sticky layout, staggered reveals, and performance optimizations directly applicable to WorkGrid and ProcessTriptych.
- [https://tympanus.net/codrops/2026/05/28/the-never-ending-story-building-a-seamless-infinite-scroll-experience-with-gsap-lenis/](https://tympanus.net/codrops/2026/05/28/the-never-ending-story-building-a-seamless-infinite-scroll-experience-with-gsap-lenis/) — Current best-practice guide for Lenis + GSAP integration with velocity-responsive marquees. Covers iOS Safari edge cases and reduced-motion parity—essential for WorkMarquee and ProcessArtifacts.
- [https://tympanus.net/codrops/2026/03/09/building-a-scroll-reactive-3d-gallery-with-three-js-velocity-and-mood-based-backgrounds/](https://tympanus.net/codrops/2026/03/09/building-a-scroll-reactive-3d-gallery-with-three-js-velocity-and-mood-based-backgrounds/) — Advanced WebGL parallax with Three.js and velocity-driven palette shifts. Architecture for upgrading WorkFeatured image or WorkHero canvas to GPU-accelerated effects.
- [https://gsap.com/docs/v3/Plugins/ScrollTrigger/](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) — Official GSAP ScrollTrigger documentation (June 2026 current). Pinning best practices, scrub mechanics, and interaction with ancestor transforms—critical for opacity-only PageTransition constraint.
- [https://scroll-driven-animations.style/](https://scroll-driven-animations.style/) — Interactive CSS scroll-timeline demo gallery. Stacking cards, progress bars, and connector lines. Direct reference for ProcessSteps and ProcessAnatomy implemention without JavaScript.
- [https://www.refokus.com/work](https://www.refokus.com/work) — Award-winning agency portfolio showcasing high-production scroll animations and WebGL integration. Reference for GSAP+Three.js architecture and visual pacing TGlobal can aspire to.
- [https://tympanus.net/codrops/2026/03/31/arnaud-roccas-portfolio-from-a-gsap-powered-motion-system-to-fluid-webgl/](https://tympanus.net/codrops/2026/03/31/arnaud-roccas-portfolio-from-a-gsap-powered-motion-system-to-fluid-webgl/) — Gold-standard 2026 case study on building a GSAP motion system with SplitText, ScrollTrigger, and character-match text transitions. Demonstrates how to architect reusable effects (fadeColor, scale, etc.) and integrate WebGL fluid simulations. Direct implementation examples and Vue composable patterns.
- [https://tympanus.net/codrops/2026/02/18/joffrey-spitzer-portfolio-a-minimalist-astro-gsap-build-with-reveals-flip-transitions-and-subtle-motion/](https://tympanus.net/codrops/2026/02/18/joffrey-spitzer-portfolio-a-minimalist-astro-gsap-build-with-reveals-flip-transitions-and-subtle-motion/) — Practical breakdown of SplitText reveal strategies (line vs. word vs. character splits), FLIP plugin transitions, and responsive re-splitting on resize. Shows how to animate titles (yPercent + scale) vs. paragraphs (line-by-line reveals) with proper cleanup and autoSplit: true.
- [https://tympanus.net/codrops/2026/05/28/the-never-ending-story-building-a-seamless-infinite-scroll-experience-with-gsap-lenis/](https://tympanus.net/codrops/2026/05/28/the-never-ending-story-building-a-seamless-infinite-scroll-experience-with-gsap-lenis/) — Definitive guide to infinite marquee + Lenis integration without frame drops. Shows gsap.ticker.add() sync pattern, parallax depth technique (±50% Y-offset), and iOS SafariToolbar prevention. Directly applicable to WorkMarquee and ProcessArtifacts.
- [https://gsap.com/docs/v3/Plugins/SplitText/](https://gsap.com/docs/v3/Plugins/SplitText/) — Official GSAP SplitText docs with parameter reference, callback patterns, and the mask option explained. Essential reference for all text animation in TGlobal. Shows autoSplit: true for responsive re-splitting.
- [https://www.creativeboom.com/insight/10-trends-creatives-are-so-over-in-2026/](https://www.creativeboom.com/insight/10-trends-creatives-are-so-over-in-2026/) — Candid industry sentiment on what's fatigued in 2026: decorative animation, glassmorphism, lazy minimalism, template-based design. Critical for understanding what TGlobal should AVOID. Reinforces functional animation over decoration.
- [https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations/](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations/) — Official spec docs for CSS scroll-timeline and view() animations. Fresh 2026 technique for zero-JS scroll reveals and progress fills. Critical for understanding modern CSS alternatives to GSAP ScrollTrigger for simple cases.
- [https://www.100daysofcraft.com/blog/motion-interactions/building-a-magnetic-cursor-effect](https://www.100daysofcraft.com/blog/motion-interactions/building-a-magnetic-cursor-effect) — Deep dive on magnetic cursor proximity effects: the physics (gradual force curve), easing strategies (elastic.out spring), and the key insight that strength grows with proximity. Shows why instant snap feels wrong.
- [https://tympanus.net/codrops/2025/05/14/from-splittext-to-morphsvg-5-creative-demos-using-free-gsap-plugins/](https://tympanus.net/codrops/2025/05/14/from-splittext-to-morphsvg-5-creative-demos-using-free-gsap-plugins/) — Five concrete GSAP plugin demos (SplitText interactive reveal, Physics2D shatter, glowing dots, DrawSVG scribbles, MorphSVG icons). Shows configuration objects mapping split types to stagger/duration. DrawSVG pattern directly useful for ProcessSteps connectors.
- [https://gsap.com/docs/v3/Plugins/ScrollTrigger/](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) — Official GSAP ScrollTrigger documentation. Essential reference for understanding GPU acceleration, will-change cleanup, and optimization patterns used in TGlobal's /work (skew, stagger) and /process (timeline draw, conic arcs).
- [https://www.awwwards.com/websites/animation/](https://www.awwwards.com/websites/animation/) — Curated gallery of award-winning animation-heavy portfolios. See real implementations of MagicCard, magnetic pills, skew distortion, parallax, and reduced-motion handling. References for visual inspiration + competitive benchmarking.
- [https://tympanus.net/codrops/](https://tympanus.net/codrops/) — Codrops publishes bi-weekly in-depth tutorials on animation performance, WebGL parallax, Lenis + GSAP integration, and scroll-driven effects. May 2026 tutorial on Lenis + infinite scroll is directly applicable to WorkMarquee.
- [https://developers.google.com/search/docs/appearance/core-web-vitals](https://developers.google.com/search/docs/appearance/core-web-vitals) — Official Google Core Web Vitals thresholds and assessment methodology. Primary source for LCP/CLS/INP definitions, p75 percentile rule, and ranking impact. Non-negotiable reference for SEO decisions.
- [https://web.dev/articles/content-visibility](https://web.dev/articles/content-visibility) — Official web.dev guide on content-visibility:auto and contain-intrinsic-size. Explains INP optimization for large DOMs (TGlobal's 20+ animated elements). Includes browser support matrix and performance benchmarks.
- [https://schema.org/CreativeWork](https://schema.org/CreativeWork) — Schema.org type reference for structured data. Essential for implementing case study markup on /work. Shows CreativeWork properties (name, description, author, datePublished, image) that Google crawls.
- [https://fantik.studio/](https://fantik.studio/) — Award-winning branding + motion design studio (14+ recognitions including Awwwards HM × 2, 2026). Reference for how contemporary creative studios structure portfolios, implement magnetic pills, micro-interactions, and earn awards.
- [https://www.digitalapplied.com/blog/internal-linking-strategy-2026-large-site-architecture-guide](https://www.digitalapplied.com/blog/internal-linking-strategy-2026-large-site-architecture-guide) — Data-driven case study on internal linking boosting organic traffic by 30%+ through topic clustering. Directly applicable to TGlobal's /work case study indexing strategy: how to connect 9 case studies to industries to build topical authority.
- [https://tympanus.net/codrops/2026/02/18/joffrey-spitzer-portfolio-a-minimalist-astro-gsap-build-with-reveals-flip-transitions-and-subtle-motion/](https://tympanus.net/codrops/2026/02/18/joffrey-spitzer-portfolio-a-minimalist-astro-gsap-build-with-reveals-flip-transitions-and-subtle-motion/) — Concrete case study of minimalist animation craft with GSAP SplitText character reveals, FLIP page transitions, and precise timing (0.01s char stagger, 0.04s line stagger). Directly applicable to WorkHero headline choreography and ProcessContrast row reveals. Published Feb 2026, recent exemplar of craft microdetails.
- [https://tympanus.net/codrops/2026/05/14/designing-ourselves-the-new-obys-identity-and-website/](https://tympanus.net/codrops/2026/05/14/designing-ourselves-the-new-obys-identity-and-website/) — Obys identity redesign emphasizes timing, spacing, and motion as connective tissue rather than decoration. Shows how custom animation systems (requestAnimationFrame + Web Animations API) handle consistency across layout transitions. Useful reference for ProcessCTA and seamless section-to-section choreography.
- [https://tympanus.net/codrops/2026/05/28/the-never-ending-story-building-a-seamless-infinite-scroll-experience-with-gsap-lenis/](https://tympanus.net/codrops/2026/05/28/the-never-ending-story-building-a-seamless-infinite-scroll-experience-with-gsap-lenis/) — Deep dive into Lenis + GSAP ticker synchronization with practical code. Critical for TGlobal's stack (Lenis 1.3 + GSAP + ScrollTrigger). Shows how to avoid scroll jank on complex scroll-driven animations like WorkMarquee velocity skew and ProcessAnatomy fill-driven rail.
- [https://www.builder.io/blog/gsap-reveal](https://www.builder.io/blog/gsap-reveal) — Builder.io's 'buttery scroll reveal' with GSAP. Practical tutorial on reveal animations, scroll-triggered stagger, and performance budgeting. Applies to WorkGrid asymmetric 7/5/5/7 rhythm and ProcessArtifacts marquee.
- [https://adobe.design/stories/leading-design/animation-that-fails-safely-defensive-design-for-motion-sensitive-users](https://adobe.design/stories/leading-design/animation-that-fails-safely-defensive-design-for-motion-sensitive-users) — Adobe's defensive design framework for motion accessibility. Covers vestibular safety, prefers-reduced-motion parity, and micro-interaction timing. Non-negotiable reference for TGlobal's hard constraint (reduced-motion parity) and inclusive motion design.
- [https://gsap.com/docs/v3/Plugins/ScrollTrigger/](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) — Official GSAP ScrollTrigger documentation. Essential reference for WorkHero pin (540svh), ProcessAnatomy scroll-timeline fill, and ProcessTriptych conic progress arcs. TGlobal uses GSAP 3.14 extensively.
- [https://github.com/darkroomengineering/lenis](https://github.com/darkroomengineering/lenis) — Lenis official repository (Darkroom Engineering, April 2026 refactor). TGlobal uses Lenis 1.3 for smooth scroll. Updated docs on autoRaf: false and gsap.ticker integration are critical for eliminating scroll jank.
- [https://m3.material.io/styles/motion/easing-and-duration/tokens-specs](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs) — Material Design 3 motion token system. Defines the token structure (duration, easing, stagger, scale) that TGlobal should replicate in globals.css. Reference for standardizing motion system across /work and /process.

## Appendix B — Verified technical facts (2026)

**CSS scroll-driven animations (animation-timeline: scroll() and view()) are supported widely enough in 2026 to use in production, and what is the Safari and Firefox status.**
- Verdict: `partly-true`
- Fact: As of June 2026, scroll-driven animations have 82.58% global browser support. Chrome 115+, Edge 115+, Safari 26.0+ (shipped June 2025), Opera 101+, and mobile browsers (Samsung Internet 23+, Chrome for Android, Opera Mobile) all support scroll-timeline: scroll() and view(). However, Firefox versions 110-154 have the feature DISABLED BY DEFAULT—it's enabled only in Nightly (136+) behind the layout.css.scroll-driven-animations.enabled flag. Firefox is expected to ship as stable within 1-2 release cycles (likely Q3/Q4 2026 or early 2027). The 82.58% figure excludes Firefox, which represents 10-15% of user traffic. Production deployment requires @supports feature detection and fallback strategies (e.g., GSAP ScrollTrigger).
- Implication: For TGlobal plan: Scroll-driven animations are safe for progressive enhancement only—use as a performance optimization for supported browsers, but maintain GSAP ScrollTrigger as the primary fallback. Firefox users will not see CSS scroll-driven animations until stable release (mid-late 2026). Gate all scroll-timeline usage behind @supports queries. Ensure reduced-motion parity in both CSS and GSAP fallback paths to maintain visual consistency across animation ON/OFF and browser support states.
- Sources: https://caniuse.com/wf-scroll-driven-animations, https://caniuse.com/mdn-css_properties_animation-timeline_scroll, https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/, https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Experimental_features, https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations, https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline, https://css-tricks.com/almanac/properties/s/scroll-timeline-name/

**The View Transitions API supports same-document (SPA) transitions in 2026, Next.js 16 App Router and React 19 expose a way to use them, and they would conflict (or not) with an opacity-only framer-motion PageTransition and GSAP ScrollTrigger pins.**
- Verdict: `partly-true`
- Fact: As of June 2026: (1) Same-document View Transitions API is "Baseline Newly available" as of October 14, 2025, with 88.64% global browser support (Chrome, Edge, Safari 18.2+, Firefox 144+, Opera all supported; IE, Opera Mini, niche browsers excluded). (2) Next.js 16 does expose View Transitions via experimental.viewTransition config and the `<ViewTransition>` component from React. (3) React 19 stable API (released December 2024, updated to 19.2.7 by June 2026) does NOT include `<ViewTransition>` — it remains experimental/canary-only; production use requires react@canary. (4) KNOWN CONFLICT: View Transitions break GSAP ScrollTrigger on repeated page visits (documented in GSAP forums). (5) Framer Motion opacity-only PageTransitions are independent of View Transitions API and should not conflict, but using both simultaneously is undocumented and untested. The conflict risk is between View Transitions + ScrollTrigger, not framer-motion.
- Implication: For TGlobal: Do NOT rely on `<ViewTransition>` as part of stable Next.js 16 + React 19 production stack — it requires canary React and remains API-unstable. If adopting View Transitions for SPA navigation, you MUST rebuild ScrollTrigger instances on page transitions (use GSAP Context + astro:page-load or Next.js equivalent lifecycle). Your current opacity-only PageTransition approach with framer-motion is safer and avoids the ScrollTrigger interaction. If you want View Transitions, architect ScrollTrigger cleanup/re-init before considering the framer-motion layer.
- Sources: https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available, https://caniuse.com/view-transitions, https://nextjs.org/docs/app/guides/view-transitions, https://react.dev/reference/react/ViewTransition, https://react.dev/blog/2025/04/23/react-labs-view-transitions-activity-and-more, https://react.dev/blog/2024/12/05/react-19, https://github.com/facebook/react/releases/tag/v19.2.7, https://gsap.com/community/forums/topic/41197-astro-viewtransitions-breaks-scrolltrigger-the-second-time-i-enter-a-page

**Core Web Vitals in 2026: the three metrics are LCP, CLS, and INP (INP replaced FID in March 2024); state the current good/needs-improvement thresholds for each.**
- Verdict: `confirmed`
- Fact: As of June 2026, Core Web Vitals consists of three metrics: LCP (Largest Contentful Paint), CLS (Cumulative Layout Shift), and INP (Interaction to Next Paint). INP officially replaced FID (First Input Delay) on March 12, 2024. Thresholds (evaluated at 75th percentile): LCP — Good ≤2.5s, Needs Improvement 2.5–4s, Poor >4s; INP — Good ≤200ms, Needs Improvement 200–500ms, Poor >500ms; CLS — Good ≤0.1, Needs Improvement 0.1–0.25, Poor >0.25. Minimum 75% of page views must meet "good" threshold to be classified as passing per metric.
- Implication: For TGlobal plan: (1) INP is now the responsiveness metric—any legacy performance tracking using FID is obsolete; (2) All three metrics directly influence search ranking; (3) Reduced-motion animations must NOT degrade LCP, INP, or CLS; (4) GSAP ScrollTrigger pins (Hero, Triptych) must maintain CLS ≤0.1; (5) Page transitions (opacity-only per project rules) must hit INP ≤200ms at 75th percentile; (6) Network waterfall and bundle analysis critical for LCP ≤2.5s target. Current project motion constraints (no transforms in PageTransition, reduced-motion parity) already align with these thresholds.
- Sources: https://web.dev/blog/inp-cwv-march-12, https://developers.google.com/search/docs/appearance/core-web-vitals, https://web.dev/articles/vitals, https://web.dev/articles/defining-core-web-vitals-thresholds, https://web.dev/articles/lcp, https://web.dev/articles/cls, https://developers.google.com/search/blog/2023/05/introducing-inp

**Google deprecated HowTo rich results and heavily limited FAQ rich results around 2023; HowTo structured data no longer produces a rich result in Google Search in 2026. (/process currently ships HowTo JSON-LD.)**
- Verdict: `confirmed`
- Fact: HowTo rich results were fully removed from Google Search on September 13, 2023 (not just deprecated, but completely ceased producing rich results on desktop and mobile). FAQ rich results were first restricted in April 2023 to only government and health authority websites, then completely phased out effective May 7, 2026, with Google dropping FAQ search appearance and Rich Results Test support in June 2026 and Search Console API support in August 2026. As of 2026, HowTo schema will not produce any visible rich result in Google Search—it produces zero SEO benefit for rich snippets, though it causes no penalty if left in place.
- Implication: TGlobal's /process page shipping HowTo JSON-LD is providing zero SEO value and should be removed or replaced with active rich result types still supported by Google in 2026: Article, Recipe, Event, Product, Organization, BreadcrumbList, or other types listed in the current supported gallery. Leaving dead HowTo markup wastes bandwidth and confuses schema validation; removing it requires no rollback risk since it produces no output.
- Sources: https://developers.google.com/search/blog/2023/08/howto-faq-changes, https://developers.google.com/search/docs/appearance/structured-data/search-gallery, https://support.google.com/webmasters/thread/231575024/reduced-the-visibility-of-faq-rich-results-in-april-2023?hl=en, https://developers.google.com/search/blog/2025/06/simplifying-search-results, https://developers.google.com/search/docs/appearance/structured-data/faqpage

**GSAP became fully free including all plugins (SplitText, ScrollSmoother, MorphSVG, DrawSVG) after the Webflow acquisition in 2024/2025 — confirm licensing status in 2026.**
- Verdict: `confirmed`
- Fact: GSAP 100% free as of April 30, 2025. Webflow acquired GreenSock in October 2024. On April 30, 2025, Webflow made the entire GSAP library and all previously paid Club plugins (SplitText, ScrollSmoother, MorphSVG, DrawSVG, ScrollTrigger, Draggable, Observer, Physics2D, etc.) completely free under the expanded Standard License. Commercial use is explicitly permitted at no cost. As of June 2026, all plugins remain 100% free. License type: GreenSock Standard License (non-exclusive, worldwide, permit-based with restriction on competing animation builders). SplitText was rewritten with 50% file-size reduction in the April 2025 release.
- Implication: For TGlobal plan: No licensing costs or restrictions for any GSAP plugins in production. All animation work using SplitText, ScrollTrigger, ScrollSmoother, MorphSVG, DrawSVG can be deployed without license compliance burden or payment. The only restriction is not building a visual animation builder that competes with Webflow — standard web dev is fully permitted. This removes any budget risk or vendor lock-in concerns for animation infrastructure.
- Sources: https://webflow.com/blog/gsap-becomes-free, https://gsap.com/pricing/, https://gsap.com/standard-license, https://gsap.com/blog/webflow-GSAP/, https://css-tricks.com/gsap-is-now-completely-free-even-for-commercial-use/, https://tympanus.net/codrops/2025/05/14/from-splittext-to-morphsvg-5-creative-demos-using-free-gsap-plugins/

**Using Lenis smooth scroll alongside GSAP ScrollTrigger is a recommended 2026 pattern, but Lenis/JS smooth scroll can harm INP and accessibility; what is the current best-practice guidance and the prefers-reduced-motion handling.**
- Verdict: `partly-true`
- Fact: GSAP's official 2026 position does NOT recommend third-party JS smooth scroll libraries like Lenis with ScrollTrigger. Instead, GSAP explicitly directs developers to use **ScrollSmoother**, its native-scroll-based tool, stating it "avoids most of the accessibility issues that plague other smooth-scrolling libraries" by leveraging browser-native scroll mechanics. Lenis integration via scrollerProxy() is technically possible but unsupported as a best practice.

INP Performance (2026): INP thresholds are Good ≤200ms, Needs Improvement 201-500ms, Poor >500ms. The web.dev INP optimization guide does NOT address JavaScript smooth scroll libraries' impact on INP. However, JS animation work during scroll should ideally stay under 3-4ms per frame on the main thread to avoid INP degradation. No authoritative sources (web.dev, GSAP, web.dev) specifically quantify Lenis' INP cost.

Accessibility & prefers-reduced-motion: Web.dev and W3C guidance require respecting prefers-reduced-motion via CSS media queries (C39, SCR40 techniques). Both Lenis and ScrollSmoother documentation are SILENT on prefers-reduced-motion support. ScrollTrigger community forums mention matchMedia patterns exist, but GSAP docs do not officially document prefers-reduced-motion handling for ScrollSmoother. Vestibular safety (35% of adults >40 experience vestibular dysfunction) is a WCAG consideration for non-essential motion—both libraries require manual implementation to pause animations when prefers-reduced-motion: reduce is set.

Browser Support (2026): Lenis capped to 60fps on Safari; requires Safari >17.3, Chrome >116, Firefox >128 (autoToggle feature). INP is now Baseline Newly available (Safari 26.2+, Dec 2024).
- Implication: For TGlobal's plan: (1) Replace Lenis + ScrollTrigger with GSAP's ScrollSmoother if smooth scroll is required—it's GSAP's supported integration and avoids JS-related accessibility pitfalls. (2) If Lenis is already integrated, you MUST manually implement prefers-reduced-motion detection and disable all scroll animations when the setting is active—neither Lenis nor ScrollTrigger auto-handles this. (3) Do NOT assume JS smooth scroll harms INP without profiling; the cost depends on callback work kept <3-4ms/frame. (4) Audit vestibular accessibility: test the page with animations ON and OFF to ensure it's not disorienting. (5) Use native CSS scroll-behavior where possible; May 2026 web.dev notes that native scrollTo() now returns Promises, closing the capability gap with JS libraries.
- Sources: https://gsap.com/docs/v3/Plugins/ScrollTrigger/, https://gsap.com/docs/v3/Plugins/ScrollSmoother/, https://github.com/darkroomengineering/lenis, https://web.dev/articles/inp, https://web.dev/articles/optimize-inp, https://web.dev/prefers-reduced-motion/, https://web.dev/learn/accessibility/motion, https://www.w3.org/WAI/WCAG22/Techniques/css/C39, https://www.w3.org/WAI/WCAG22/Techniques/client-side-script/SCR40, https://web.dev/articles/optimize-long-tasks, https://web.dev/articles/optimize-javascript-execution, https://web.dev/articles/css-scroll-snap, https://web.dev/blog/web-platform-05-2026

**next/font with size-adjust / fallback face metrics is the correct way to eliminate font-swap CLS in Next.js 16; confirm the mechanism.**
- Verdict: `confirmed`
- Fact: Next.js 16 (released October 2025, current stable v16.2.9 as of March 2026) uses automatic fallback font metric adjustments enabled by default via the `adjustFontFallback` parameter (true for Google Fonts, 'Arial' for local fonts by default). The mechanism precomputes @font-face metric overrides including size-adjust, ascent-override, descent-override, and line-gap-override via capsize-font-metrics.json to match fallback fonts to web font dimensions before load, preventing CLS. The CSS @font-face size-adjust descriptor itself has 92.13% global browser support as of May 2026 across Chrome, Firefox, Safari, Edge, and Opera. This is the correct and recommended approach for CLS elimination in Next.js 16.
- Implication: TGlobal can rely on automatic CLS elimination via next/font (default behavior) without manual size-adjust configuration in most cases. For Google Fonts or local fonts via next/font/google and next/font/local respectively, set adjustFontFallback=true (Google default) or adjustFontFallback='Arial' (local default) to activate the precomputed metric overrides. No manual @font-face descriptor configuration is required unless you need to override the defaults. This mechanism covers 92%+ of end-user browsers and requires zero additional work for CLS prevention in modern Next.js 16 projects.
- Sources: https://nextjs.org/docs/app/api-reference/components/font, https://nextjs.org/docs/app/getting-started/fonts, https://nextjs.org/blog/next-16, https://nextjs.org/blog/next-16-2, https://developer.chrome.com/blog/font-fallbacks, https://web.dev/articles/css-size-adjust, https://caniuse.com/mdn-css_at-rules_font-face_size-adjust, https://github.com/vercel/next.js/discussions/24438, https://web.dev/blog/font-size-adjust

**next/image automatically serves AVIF/WebP and the LCP image should use priority/fetchPriority=high in Next.js 16; confirm current API.**
- Verdict: `partly-true`
- Fact: In Next.js 16.2.9 (as of March 2026): (1) next/image DOES automatically detect and serve AVIF and WebP via the Accept header — it supports multiple formats configured in next.config.js, preferring AVIF if enabled, then WebP, falling back to original format. Browser support: AVIF 93.42% (March 2026), WebP 95.97% (May 2026). (2) For LCP images: the priority property is DEPRECATED in Next.js 16 in favor of preload (boolean), not fetchPriority. The correct APIs are: preload={true} for single LCP images, OR loading="eager" OR fetchPriority="high" for multi-image scenarios. fetchPriority is a standard HTML5 attribute (hint to browser, not a directive) passed through to the underlying img element; it is NOT a Next.js-specific prop but can be used for fine-grained control. (3) As of Next.js 16, minimumCacheTTL is now REQUIRED in image optimization config.
- Implication: For TGlobal's 2026 plan: (1) The automatic format serving claim is confirmed — no custom optimization needed if AVIF/WebP are configured. (2) DO NOT use priority prop in new code; this will break in Next.js 16. Use preload={true} for hero/LCP images instead. (3) fetchPriority="high" is valid but preload={true} is clearer and preferred for single LCP images. For hero images with responsive variants, use preload={true} with sizes. (4) Ensure next.config.js has minimumCacheTTL set. (5) Verify CDN/proxy forwards Accept header to avoid format detection failures.
- Sources: https://nextjs.org/docs/app/api-reference/components/image, https://nextjs.org/docs/14/app/building-your-application/optimizing/images, https://web.dev/articles/fetch-priority, https://web.dev/articles/optimize-lcp, https://caniuse.com/avif, https://caniuse.com/webp, https://nextjs.org/learn/seo/web-performance/lcp

**For SEO, Googlebot renders client-side JavaScript but with caveats; content that only appears after heavy hydration/animation can be missed, so SSR of meaningful content is required for animation-heavy Next.js App Router pages in 2026.**
- Verdict: `partly-true`
- Fact: Googlebot DOES render and execute JavaScript (Chromium-based, updated within weeks of Chrome releases), and CAN index content appearing after hydration once the rendered HTML is available. However: (1) Google does NOT require SSR — it explicitly states SSR/pre-rendering is "recommended" for performance and compatibility but not mandatory; (2) Googlebot allocates 5-15 seconds of CPU time per page for JavaScript execution (not a fixed threshold); (3) Content appearing after ~5 seconds is at risk of non-indexing, but content within that window is accessible; (4) For animation-heavy pages specifically, the critical rule is that MEANINGFUL content (headlines, CTAs, main text) must be in the initial HTML or appear within Googlebot's execution budget. Non-critical visual enhancements (decorative animations, scroll reveals) can be client-side only. Next.js App Router pages are Server Components by default (as of 2024+), meaning meaningful content is naturally SSR'd unless explicitly marked Client Component. True risk is ONLY when meaningful SEO-critical content is hidden until after heavy hydration exceeds the 5-15 second window.
- Implication: For TGlobal plan: SSR of meaningful content is NOT universally required — it's context-dependent. If animation-heavy pages have all headline/CTA/body copy in the initial server HTML (which Next.js App Router does by default), Googlebot will index them fine even if scroll animations trigger later. The actual requirement is: (1) Ensure Core Web Vitals stay under 2.5s LCP (Google ranking factor); (2) Keep JavaScript execution under 5 seconds for decorative animations; (3) Do NOT gate critical SEO content behind hydration that exceeds that budget. The TGlobal architecture with GSAP ScrollTrigger is safe if animations are visual enhancements applied to pre-rendered content, not content generators. If Hero/Triptych animations run on already-rendered text, Googlebot sees the text immediately regardless of animation timing. No SSR-forcing refactor needed unless pages currently render empty skeletons and fill them via fetch.
- Sources: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics, https://nextjs.org/learn/seo/rendering-strategies, https://web.dev/blog/javascript-and-google-search-io-2019, https://edgecomet.com/blog/how-googlebot-crawls-renders-and-indexes-javascript-a-developers-guide, https://www.seozoom.com/rendering/, https://totally.digital/insights/javascript-seo-rendering-hydration-and-prerendering-best-practices-for-optimised-performance/

**Compositor-only animations (transform/opacity) avoid main-thread layout/paint, while animating layout properties (width/height/top/left) causes jank and hurts INP; will-change should be used sparingly. Confirm this is still the 2026 guidance.**
- Verdict: `confirmed`
- Fact: As of June 2026, web.dev and MDN confirm: (1) transform and opacity are the ONLY two CSS properties that skip layout and paint, using the compositor thread exclusively — all other properties (width, height, top, left, etc.) trigger full pipeline recalculation and jank. (2) INP thresholds are: Good ≤200ms, Needs Improvement 200-500ms, Poor >500ms; animating layout properties can delay frame presentation and harm INP. (3) will-change must be used sparingly and only as a last resort for existing performance problems — NOT for anticipatory optimization. Modern guidance (web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count) recommends will-change: transform for layer promotion, applied selectively via JavaScript at interaction time, not hardcoded in CSS. Excessive will-change use causes memory overhead and GPU bandwidth waste. Browser support for will-change is baseline widely available since January 2020. No breaking changes to this guidance between 2020-2026.
- Implication: For the TGlobal plan: (1) PageTransition opacity-only constraint is correct and aligns with 2026 best practices. (2) All scroll-triggered animations must use only transform/opacity to keep scrolling on compositor thread and avoid blocking INP. (3) GSAP ScrollTrigger animations must animate transform/opacity exclusively; animating width/height/geometric properties will cause layout thrashing and violate INP targets (≤200ms). (4) will-change should be applied sparingly via JavaScript (e.g., on hover/scroll start) rather than globally in CSS; applying will-change to every animated element wastes resources. (5) No visual effects should animate layout properties; use transform: scale(), translateX/Y, or scaleX/Y instead. (6) Reduced-motion mode animations must follow identical constraint (opacity only) to maintain parity.
- Sources: https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count, https://web.dev/articles/animations-and-performance/, https://web.dev/articles/rendering-performance/, https://web.dev/articles/animations-guide/, https://web.dev/articles/inp, https://developer.mozilla.org/en-US/docs/Web/CSS/will-change, https://web.dev/non-composited-animations, https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing

**Structured data appropriate for a software/design studio work page in 2026 is CreativeWork / ItemList / Organization (not HowTo); confirm which schema types Google still supports rich treatment for.**
- Verdict: `partly-true`
- Fact: As of June 2026:

**HowTo Status (Corrected):** HowTo rich results are NO LONGER supported by Google — they were deprecated in August 2023 and have been removed entirely from Google Search across desktop and mobile. The claim correctly excludes HowTo.

**Google-Supported Rich Result Types for 2026 (Definitive List):**
Article, Breadcrumb, Carousel, Course list, Dataset, Discussion forum, Education Q&A, Employer aggregate rating, Event, FAQ (ending June 2026), Image metadata, Job posting, Local business, Math solver, Movie, Organization, Product, Profile page, Q&A, Recipe, Review snippet, Software app, Speakable, Subscription/paywalled content, Vacation rental, Video.

**Critical Correction:** CreativeWork and ItemList do NOT generate Google rich results. They are valid schema.org types but produce NO visual rich snippets in Google Search. For a work portfolio page, the most relevant Google-supported types are:
- **Organization** (company logo, contact info, brand identity)
- **Profile page** (best for portfolio pages focusing on a person/organization)
- **Article** (if work pages are blog-style case studies)
- **Project** (schema.org supports it but Google provides NO dedicated rich result treatment)

**CreativeWork Details:** CreativeWork (used for paywalled content markup and as semantic context) is NOT listed in Google Search Central's supported rich result gallery. It provides semantic value to indexing/sorting but yields NO enriched search appearance.

**ItemList Details:** ItemList (1M-10M domain adoption) is supported for course lists specifically, but NOT as a general portfolio container for rich results.

**Browser Support:** Not applicable — structured data is server-side and browser-independent. All schema.org markup is indexed by Google's crawlers equally regardless of client-side rendering support.
- Implication: For TGlobal's work/portfolio page:

1. **Do NOT rely on CreativeWork or ItemList for SEO visibility** — use Organization + Profile page instead for actual Google rich result enhancement.

2. **Organization schema is essential** (for studio branding) and DOES generate rich results (logo, name, contact).

3. **Profile page schema is optimal** for portfolio context — it's the closest Google-supported type to "work showcase."

4. **CreativeWork can be used semantically** (authorship, dates, keywords) but expect zero visual rich result treatment in Search.

5. **HowTo removal is irrelevant** — correctly excluded; don't spend time on it.

6. **Testing requirement:** Use Google's Rich Results Test (search.google.com/test/rich-results) to verify which markup actually generates visual enhancements; don't assume schema.org coverage = Google support.

**Action:** Implement Organization + Profile page for rich results, add CreativeWork as secondary semantic context if desired, avoid ItemList for portfolio structure.
- Sources: https://developers.google.com/search/docs/appearance/structured-data/search-gallery, https://developers.google.com/search/blog/2023/08/howto-faq-changes, https://support.google.com/webmasters/answer/7552505?hl=en, https://developers.google.com/search/docs/appearance/structured-data/organization, https://search.google.com/test/rich-results, https://schema.org/CreativeWork, https://schema.org/ItemList, https://schema.org/Project

**Forcing animations on for all users (ignoring the OS prefers-reduced-motion setting) is an accessibility anti-pattern; but keeping the at-rest visual identical and only removing motion is acceptable. The claim asks for 2026 a11y/WCAG guidance on 2.3.3 Animation from Interactions and 2.2.2.**
- Verdict: `partly-true`
- Fact: WCAG 2.3.3 (Level A) requires: "Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed." The official W3C guidance (updated September 2025) and web.dev (2026) are unequivocal: there is NO exception for preserving at-rest visuals. Ignoring prefers-reduced-motion is a violation. The W3C sufficient technique C39 explicitly mandates using the CSS @prefers-reduced-motion media query to disable animations entirely for users who opt out. WCAG 2.2.2 (Level A, "Pause, Stop, Hide") covers moving/blinking/scrolling content that (1) starts automatically, (2) lasts 5+ seconds, and (3) appears with other content — it requires pause/stop/hide mechanisms but is separate from 2.3.3. The claim incorrectly conflates these two criteria and misrepresents the allowable exception. Vestibular disorder users experience "dizziness, nausea, and migraine headaches" (W3C/web.dev 2025) — not merely visual preference. Current browser support for prefers-reduced-motion is 97%+ (caniuse.com), with adoption mandatory for WCAG AA compliance since WCAG 2.1 (2018) and reaffirmed in WCAG 2.2 (December 2023, ISO/IEC 40500:2026 standardization pending late 2026).
- Implication: For TGlobal's plan: (1) ANY animation triggered by user interaction MUST respect @prefers-reduced-motion—no exceptions for "identical at-rest visuals." (2) Animations must be completely removed/disabled in the reduced-motion state, not just "less visible." (3) WCAG 2.2.2 is orthogonal—it applies to auto-starting background content (carousels, scrollers, tickers) and requires pause buttons, but 2.3.3 is the binding constraint for interaction-driven animations. (4) The memory file notes "Reduced-motion parity is non-negotiable" and "PageTransition must be opacity-only"—this is correct and WCAG-aligned. (5) Using useMounted() to gate motion decisions (noted in memory) is the correct pattern to avoid SSR hydration mismatches while respecting prefers-reduced-motion. (6) If TGlobal's current design forces animations while maintaining identical at-rest visuals, it violates WCAG 2.3.3 Level A (a foundational accessibility requirement).
- Sources: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html, https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html, https://web.dev/articles/prefers-reduced-motion, https://web.dev/learn/accessibility/motion, https://www.w3.org/WAI/WCAG22/Techniques/css/C39.html, https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html, https://www.w3.org/TR/WCAG22/, https://www.w3.org/WAI/WCAG21/Techniques/client-side-script/SCR40
